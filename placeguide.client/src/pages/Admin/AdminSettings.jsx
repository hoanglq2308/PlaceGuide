import { useMemo, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { createAdminAccount } from '../../services/adminSettingsService';

const initialForm = {
  fullName: '',
  account: '',
  password: '',
  confirmPassword: ''
};

function getStoredAdminName() {
  try {
    return JSON.parse(window.localStorage.getItem('user') || '{}').fullName ||
      'Quản trị viên';
  } catch {
    return 'Quản trị viên';
  }
}

function AdminSettings() {
  const adminName = useMemo(() => getStoredAdminName(), []);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdAdmin, setCreatedAdmin] = useState(null);

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
    setError('');
    setCreatedAdmin(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setCreatedAdmin(null);

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại chưa khớp.');
      return;
    }

    setIsSubmitting(true);

    try {
      const admin = await createAdminAccount({
        fullName: form.fullName.trim(),
        account: form.account.trim(),
        password: form.password
      });

      setCreatedAdmin(admin);
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1a1c1a] lg:flex">
      <AdminSidebar adminName={adminName} />

      <main className="min-w-0 flex-1">
        <header className="border-b border-[#e5e1da] bg-white/85 px-4 py-4 backdrop-blur sm:px-5 lg:px-8">
          <h1 className="text-xl font-extrabold text-[#af101a]">Cài đặt</h1>
          <p className="mt-1 text-sm text-[#6e6a66]">
            Quản lý quyền truy cập và tài khoản quản trị hệ thống.
          </p>
        </header>

        <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-5 lg:p-8">
          <section className="rounded-xl border border-[#e5e1da] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold">Tạo tài khoản admin</h2>
                <p className="mt-1 text-sm leading-6 text-[#6e6a66]">
                  Tài khoản mới sẽ đăng nhập bằng email hoặc số điện thoại và có quyền Admin ngay sau khi tạo.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#fff3f2] px-3 py-2 text-sm font-bold text-[#b71422]">
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                Admin
              </span>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-[#fecaca] bg-[#fff5f5] p-4 text-sm font-semibold text-[#991b1b]">
                {error}
              </div>
            )}

            {createdAdmin && (
              <div className="mb-5 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-sm text-[#166534]">
                <p className="font-bold">Đã tạo tài khoản admin thành công.</p>
                <p className="mt-1">
                  {createdAdmin.fullName} · {createdAdmin.email || createdAdmin.phoneNumber}
                </p>
              </div>
            )}

            <form className="grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-1.5 text-sm font-semibold text-[#5b403d]">
                Họ tên
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  className="h-11 rounded-lg border border-[#d9d1ce] bg-white px-3 text-sm font-medium text-[#1a1c1a] outline-none transition-colors focus:border-[#af101a]"
                  placeholder="Nguyễn Văn Admin"
                  maxLength={150}
                  required
                />
              </label>

              <label className="grid gap-1.5 text-sm font-semibold text-[#5b403d]">
                Email hoặc số điện thoại
                <input
                  type="text"
                  value={form.account}
                  onChange={(event) => updateField('account', event.target.value)}
                  className="h-11 rounded-lg border border-[#d9d1ce] bg-white px-3 text-sm font-medium text-[#1a1c1a] outline-none transition-colors focus:border-[#af101a]"
                  placeholder="admin@vinafood.vn hoặc 090..."
                  required
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold text-[#5b403d]">
                  Mật khẩu
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    className="h-11 rounded-lg border border-[#d9d1ce] bg-white px-3 text-sm font-medium text-[#1a1c1a] outline-none transition-colors focus:border-[#af101a]"
                    minLength={6}
                    required
                  />
                </label>

                <label className="grid gap-1.5 text-sm font-semibold text-[#5b403d]">
                  Nhập lại mật khẩu
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => updateField('confirmPassword', event.target.value)}
                    className="h-11 rounded-lg border border-[#d9d1ce] bg-white px-3 text-sm font-medium text-[#1a1c1a] outline-none transition-colors focus:border-[#af101a]"
                    minLength={6}
                    required
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0eded] pt-5">
                <p className="text-sm text-[#6e6a66]">
                  Mật khẩu tối thiểu 6 ký tự theo cấu hình hiện tại của hệ thống.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#b71422] px-5 text-sm font-bold text-white transition-colors hover:bg-[#93111b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSubmitting ? 'hourglass_top' : 'person_add'}
                  </span>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo admin'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminSettings;
