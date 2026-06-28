import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchOwnerDishes,
  createNewDish,
  updateDishInfo,
  removeDish
} from '../../services/ownerDishService';

const CATEGORIES = ['Món chính', 'Khai vị', 'Đồ uống', 'Tráng miệng'];
const EMPTY_FORM = {
  name: '',
  price: '',
  category: 'Món chính',
  imageUrl: '',
  descriptionVi: '',
  isAvailable: true
};

function DishFormModal({ open, initialData, onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
    }
  }, [open, initialData]);

  if (!open) return null;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.price) {
      alert('Vui lòng nhập đầy đủ Tên món và Giá!');
      return;
    }
    onSubmit({
      Name: form.name.trim(),
      Price: Number(form.price),
      Category: form.category,
      ImageUrl: form.imageUrl.trim(),
      DescriptionVi: form.descriptionVi.trim(),
      IsAvailable: form.isAvailable
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#af101a]">
            {initialData ? 'Sửa món ăn' : 'Thêm món mới'}
          </h2>
          <button type="button" onClick={onClose} className="text-[#5b403d]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-[#5b403d]">Tên món</label>
            <input
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-[#e4beba] px-3 text-sm outline-none focus:border-[#af101a]"
              placeholder="VD: Phở bò tái lăn"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-[#5b403d]">Giá (đ)</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-[#e4beba] px-3 text-sm outline-none focus:border-[#af101a]"
                placeholder="65000"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-[#5b403d]">Phân loại</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-[#e4beba] px-3 text-sm outline-none focus:border-[#af101a]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-[#5b403d]">Link hình ảnh</label>
            <input
              value={form.imageUrl}
              onChange={(e) => updateField('imageUrl', e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-[#e4beba] px-3 text-sm outline-none focus:border-[#af101a]"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-bold text-[#5b403d]">Mô tả</label>
            <textarea
              value={form.descriptionVi}
              onChange={(e) => updateField('descriptionVi', e.target.value)}
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-[#e4beba] px-3 py-2 text-sm outline-none focus:border-[#af101a]"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-[#5b403d]">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => updateField('isAvailable', e.target.checked)}
            />
            Còn hàng (hiển thị cho khách)
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-[#e4beba] py-2.5 text-sm font-bold text-[#5b403d]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-[#af101a] py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu món'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const MenuManagement = () => {
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void loadDishes();
  }, []);

  async function loadDishes() {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchOwnerDishes();
      setMenuItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredItems = useMemo(() => {
    if (activeFilter === 'Tất cả') return menuItems;
    return menuItems.filter((item) => item.category === activeFilter);
  }, [menuItems, activeFilter]);

  function openCreateModal() {
    setEditingDish(null);
    setIsModalOpen(true);
  }

  function openEditModal(dish) {
    setEditingDish({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      category: dish.category,
      imageUrl: dish.imageUrl,
      descriptionVi: dish.descriptionVi,
      isAvailable: dish.isAvailable
    });
    setIsModalOpen(true);
  }

  async function handleSubmitForm(payload) {
    setIsSubmitting(true);
    try {
      if (editingDish) {
        const updated = await updateDishInfo(editingDish.id, payload);
        setMenuItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createNewDish(payload);
        setMenuItems((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(dish) {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa món "${dish.name}"?`);
    if (!confirmed) return;

    try {
      await removeDish(dish.id);
      setMenuItems((prev) => prev.filter((item) => item.id !== dish.id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1c] min-h-screen font-['Be_Vietnam_Pro']">
      <header className="bg-white shadow-sm fixed top-0 w-full z-40 h-16 flex items-center px-3 sm:px-4 md:px-20 justify-between">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button type="button" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined text-[#af101a] font-bold cursor-pointer">
              arrow_back
            </span>
          </button>
          <h1 className="truncate text-[18px] font-bold text-[#af101a] sm:text-[20px]">
            Quản lý Thực đơn
          </h1>
        </div>
      </header>

      <main className="pt-24 pb-28 px-4 md:px-20 max-w-[1280px] mx-auto">
        <section className="mb-10 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-6">
          <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
            {['Tất cả', ...CATEGORIES].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-6 py-2.5 rounded-full text-[14px] font-medium whitespace-nowrap border ${
                  activeFilter === tab
                    ? 'bg-[#af101a] text-white border-transparent'
                    : 'bg-white border-[#e4beba] text-[#5b403d] hover:bg-[#f6f3f2]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="bg-[#af101a] text-white px-8 py-4 rounded-full text-[16px] font-bold shadow-lg flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm món mới
          </button>
        </section>

        {isLoading ? (
          <p className="text-center text-[#5b403d] font-bold">Đang tải thực đơn...</p>
        ) : error ? (
          <div className="text-center">
            <p className="text-[#b42318] mb-3">{error}</p>
            <button onClick={loadDishes} className="rounded-lg bg-[#af101a] px-4 py-2 text-white font-bold">
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-[#eae7e7] ${
                  !item.isAvailable ? 'opacity-60' : ''
                }`}
              >
                <div className="relative h-48">
                  <img
                    className={`w-full h-full object-cover ${!item.isAvailable ? 'grayscale' : ''}`}
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'}
                    alt={item.name}
                  />
                  {item.isAvailable ? (
                    <span className="absolute top-3 right-3 bg-[#1b6d24] text-white px-3 py-1 rounded-full text-[12px] font-semibold">
                      {item.category}
                    </span>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-bold text-[18px]">Hết hàng</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-[18px] font-semibold">{item.name}</h3>
                    <span className="shrink-0 font-bold text-[#af101a]">
                      {item.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <p className="text-[#5b403d] text-[14px] line-clamp-2 mb-4 flex-1">
                    {item.descriptionVi}
                  </p>
                  <div className="flex gap-2 pt-4 border-t border-[#eae7e7]">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="flex-1 py-2 bg-[#f0eded] text-[#5b403d] text-[14px] font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-[#eae7e7]"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span> Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="w-12 h-10 bg-[#ffdad6] text-[#93000a] rounded-lg flex items-center justify-center hover:opacity-80"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={openCreateModal}
              className="border-2 border-dashed border-[#e4beba] rounded-xl flex flex-col items-center justify-center p-8 hover:bg-[#f6f3f2] hover:border-[#af101a] min-h-[300px] w-full"
            >
              <div className="w-16 h-16 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#af101a] mb-4">
                <span className="material-symbols-outlined !text-[32px]">add_circle</span>
              </div>
              <p className="text-[18px] font-semibold text-[#5b403d]">Thêm món ăn mới</p>
            </button>
          </div>
        )}
      </main>

      <DishFormModal
        open={isModalOpen}
        initialData={editingDish}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitForm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default MenuManagement;