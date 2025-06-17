# 🧾 CategoryPost DTOs

Các DTO này được sử dụng để **kiểm soát và xác thực dữ liệu đầu vào** khi tạo hoặc cập nhật danh mục bài viết trong hệ thống.  
Mọi ràng buộc đều có thông báo lỗi rõ ràng bằng tiếng Việt, tuân thủ chuẩn REST và đảm bảo tính toàn vẹn dữ liệu.

---

## 📦 `CreateCategoryPostDto`

DTO dùng để **tạo mới danh mục bài viết**.

| Trường      | Kiểu dữ liệu           | Bắt buộc | Ràng buộc                                                        | Mô tả                                                                 |
| ----------- | ---------------------- | -------- | ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| `name`      | `string`               | ✅       | - Không rỗng<br>- Từ 1 đến 100 ký tự                             | Tên danh mục hiển thị.                                                |
| `slug`      | `string`               | ❌       | - Nếu truyền thì không rỗng<br>- Backend sẽ tự sinh nếu không có | Slug thân thiện SEO – sẽ được chuẩn hóa và đảm bảo duy nhất.          |
| `level`     | `number`               | ❌       | - Số >= 0                                                        | Cấp độ phân cấp – được tính tự động từ danh mục cha (nếu có).         |
| `parent`    | `MongoId (string)`     | ❌       | - Là ObjectId hợp lệ                                             | ID danh mục cha, nếu có.                                              |
| `children`  | `MongoId[] (string[])` | ❌       | - Mảng ObjectId<br>- Không trùng lặp                             | Danh sách danh mục con. Hệ thống sẽ tự động cập nhật quan hệ cha-con. |
| `path`      | `string`               | ❌       | - Tối đa 1000 ký tự                                              | Chuỗi thể hiện đường dẫn phân cấp, tính từ danh mục gốc.              |
| `sortOrder` | `number`               | ❌       | - Là số                                                          | Thứ tự sắp xếp trong giao diện – số nhỏ hơn sẽ hiển thị trước.        |
| `isDeleted` | `boolean`              | ❌       | - true / false                                                   | Trạng thái xóa mềm – mặc định là `false`.                             |

> 🔒 Các trường `slug`, `path`, `level`, `isDeleted` sẽ được hệ thống xử lý nội bộ để đảm bảo logic thống nhất và bảo mật.

---

## 🔁 `UpdateCategoryPostDto`

DTO dùng để **cập nhật danh mục bài viết**. Kế thừa tất cả các trường từ `CreateCategoryPostDto`, nhưng tất cả đều là `optional`.

```ts
export class UpdateCategoryPostDto extends PartialType(CreateCategoryPostDto) {}
```

### ✅ Ghi chú:

- Sử dụng `PartialType()` từ `@nestjs/mapped-types` giúp dễ tái sử dụng và đảm bảo các ràng buộc giống DTO tạo mới.
- Áp dụng toàn bộ rule từ `CreateCategoryPostDto`, nhưng cho phép cập nhật linh hoạt từng trường.
- Hệ thống vẫn sẽ kiểm tra logic như:
  - Slug trùng lặp
  - Vòng lặp cha-con
  - Định dạng ObjectId
  - Quy tắc phân cấp path + level

