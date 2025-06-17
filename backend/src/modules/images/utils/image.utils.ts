export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD') // ✅ Chuẩn hóa dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // ✅ Loại bỏ dấu
    .replace(/đ/g, 'd') // ✅ Thay đ -> d
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]/g, '-') // ✅ Chỉ giữ chữ cái và số
    .replace(/-+/g, '-') // ✅ Xóa dấu `-` dư thừa
    .toLowerCase();
}
