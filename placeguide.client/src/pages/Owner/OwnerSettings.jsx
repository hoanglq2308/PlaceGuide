import { useEffect, useState } from 'react';
import OwnerSidebar from '../../components/OwnerSidebar';
import { updateOwnerSettings } from '../../services/ownerService';
import { getOwnerRestaurant } from '../../services/ownerRestaurantService';

function ToggleSwitch({ checked, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-6 w-12 rounded-full transition-colors ${checked ? 'bg-[#006e2f]' : 'bg-[#c9c4bd]'}`}
    >
      <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}

function OwnerSettings() {
  const [form, setForm] = useState({ openingTime: '', closingTime: '', isOpen: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    async function load() {
      try {
        const data = await getOwnerRestaurant();
        setForm({
          openingTime: data.openingTime || '',
          closingTime: data.closingTime || '',
          isOpen: data.isOpen || false
        });
      } catch (err) {
        setMessage({ text: err.message, type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await updateOwnerSettings(form);
      setMessage({ text: 'Đã lưu cài đặt.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] lg:flex">
      <OwnerSidebar />

      <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-8">
        <h1 className="text-xl font-extrabold text-[#b71422] lg:text-2xl">Cài đặt</h1>

        {isLoading ? (
          <p className="mt-6 text-sm font-bold text-[#5b403e]">Đang tải...</p>
        ) : (
          <form onSubmit={handleSave} className="mt-6 max-w-md space-y-5 rounded-xl border border-[#e5e1da] bg-[#fdfcfb] p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm font-bold text-[#5b403e]">Giờ mở cửa</span>
                <input
                  type="time"
                  value={form.openingTime}
                  onChange={(e) => setForm((f) => ({ ...f, openingTime: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-[#e5e1da] px-3 text-sm outline-none focus:border-[#b71422]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-[#5b403e]">Giờ đóng cửa</span>
                <input
                  type="time"
                  value={form.closingTime}
                  onChange={(e) => setForm((f) => ({ ...f, closingTime: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-[#e5e1da] px-3 text-sm outline-none focus:border-[#b71422]"
                />
              </label>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#e5e1da] bg-[#f4f3f1] p-4">
              <span className="text-sm font-bold text-[#1a1c1a]">Đang mở cửa</span>
              <ToggleSwitch checked={form.isOpen} onClick={() => setForm((f) => ({ ...f, isOpen: !f.isOpen }))} />
            </div>

            {message.text && (
              <p className={`text-sm font-bold ${message.type === 'success' ? 'text-[#1b6d24]' : 'text-[#b42318]'}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg bg-[#b71422] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default OwnerSettings;