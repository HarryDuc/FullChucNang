import imageCompression from 'browser-image-compression';
import api from '../utils/api';

export interface ImageResponse {
  originalName: string; // ✅ Tên file gốc (giữ nguyên)
  imageUrl: string; // ✅ Đường dẫn ảnh trên server
  location: string; // ✅ Full URL của ảnh (SERVER_URL + imageUrl)
  slug: string; // ✅ Slug duy nhất để quản lý ảnh
  alt: string; // ✅ Văn bản thay thế (tự động từ originalName)
  caption?: string; // ✅ Chú thích ảnh
  description?: string; // ✅ Mô tả ảnh
  createdAt?: string; // ✅ Ngày tạo
  updatedAt?: string; // ✅ Ngày cập nhật
}

// Cấu hình mặc định cho việc nén ảnh
const compressionOptions = {
  maxSizeMB: 1, // Luôn giới hạn ở 1MB
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  preserveExif: true,
  initialQuality: 0.9, // Bắt đầu với chất lượng 90%
  alwaysKeepResolution: true,
  fileType: 'image/jpeg',
};


const imageService = {
  /**
   * Nén ảnh trước khi upload
   */
  compressImage: async (file: File, customOptions?: any): Promise<File> => {
    try {
      // Kiểm tra kích thước và loại file
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        console.warn('File không phải là ảnh:', file.type);
        return file;
      }

      // Chỉ nén khi ảnh > 1MB
      if (file.size <= 1024 * 1024) {
        console.log('Ảnh đã nhỏ hơn 1MB, không cần nén:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        return file;
      }

      console.log('Bắt đầu nén ảnh:', file.name, 'Kích thước gốc:', (file.size / 1024 / 1024).toFixed(2), 'MB');

      const options = {
        ...compressionOptions,
        ...customOptions,
        maxSizeMB: customOptions?.maxSizeMB || 1, // Cho phép điều chỉnh kích thước tối đa
        initialQuality: customOptions?.initialQuality || 0.9 // Cho phép điều chỉnh chất lượng ban đầu
      };

      let compressedFile;
      try {
        compressedFile = await imageCompression(file, options);
      } catch (compressError) {
        console.error('Lỗi khi nén ảnh lần đầu, thử lại với chất lượng thấp hơn:', compressError);
        // Thử lại với chất lượng thấp hơn nếu lần đầu thất bại
        options.initialQuality = 0.7;
        compressedFile = await imageCompression(file, options);
      }

      // Kiểm tra kích thước sau khi nén
      if (compressedFile.size > options.maxSizeMB * 1024 * 1024) {
        console.warn('Ảnh vẫn lớn sau khi nén lần đầu, thử nén lần hai với chất lượng thấp hơn');
        // Thử nén lần thứ hai với cài đặt chất lượng thấp hơn
        options.initialQuality = 0.5;
        options.maxWidthOrHeight = 1280; // Giảm kích thước ảnh
        compressedFile = await imageCompression(compressedFile, options);
      }

      // Tạo file mới với tên gốc
      const newFile = new File(
        [compressedFile],
        file.name,
        { type: 'image/jpeg' }
      );

      console.log(
        'Nén ảnh hoàn tất:',
        '\nKích thước gốc:', (file.size / 1024 / 1024).toFixed(2), 'MB',
        '\nKích thước sau nén:', (newFile.size / 1024 / 1024).toFixed(2), 'MB',
        '\nTỷ lệ nén:', Math.round((1 - newFile.size / file.size) * 100) + '%',
        '\nLoại file:', newFile.type
      );

      return newFile;
    } catch (error) {
      console.error('Lỗi khi nén ảnh:', error);
      // Nếu có lỗi khi nén, trả về file gốc với kích thước giảm nếu có thể
      try {
        // Thử nén với cài đặt khẩn cấp (chất lượng thấp, kích thước nhỏ)
        const emergencyOptions = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1024,
          initialQuality: 0.4,
          useWebWorker: false,
        };

        const emergencyCompressed = await imageCompression(file, emergencyOptions);
        const emergencyFile = new File([emergencyCompressed], file.name, { type: 'image/jpeg' });

        console.log('Nén khẩn cấp thành công, kích thước mới:', (emergencyFile.size / 1024 / 1024).toFixed(2), 'MB');
        return emergencyFile;
      } catch (emergencyError) {
        console.error('Không thể nén ảnh trong chế độ khẩn cấp:', emergencyError);
        return file;
      }
    }
  },

  /**
   * Upload a single image file
   */
  uploadImage: async (file: File, compress: boolean = true): Promise<ImageResponse> => {
    const formData = new FormData();

    try {
      let processedFile = file;
      if (compress) {
        processedFile = await imageService.compressImage(file);
      }

      // Kiểm tra kích thước file sau khi xử lý
      if (processedFile.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('Kích thước file quá lớn (tối đa 10MB)');
      }

      formData.append('file', processedFile);

      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });

      return response.data;
    } catch (error: any) {
      console.error("Lỗi upload ảnh:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Upload multiple image files (up to 10)
   */
  uploadMultipleImages: async (files: File[], compress: boolean = true): Promise<ImageResponse[]> => {
    if (!files.length) {
      return [];
    }

    if (files.length > 10) {
      throw new Error('Chỉ có thể upload tối đa 10 ảnh một lần');
    }

    try {
      console.log(`Đang xử lý ${files.length} ảnh...`);

      // Xử lý từng file một thay vì song song
      const processedFiles = [];
      for (const file of files) {
        let processedFile = file;
        if (compress) {
          // Điều chỉnh thông số nén ảnh dựa trên số lượng ảnh để tránh quá tải
          const compressionLevel = files.length > 5 ? 0.7 : 0.9;
          const maxSizeMB = files.length > 5 ? 0.8 : 1;

          processedFile = await imageService.compressImage(file, {
            initialQuality: compressionLevel,
            maxSizeMB: maxSizeMB,
            maxWidthOrHeight: files.length > 5 ? 1600 : 1920
          });
        }

        // Kiểm tra kích thước
        if (processedFile.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} quá lớn (tối đa 10MB)`);
        }

        processedFiles.push(processedFile);
      }

      console.log(`Đã xử lý ${processedFiles.length} ảnh, bắt đầu tải lên...`);

      // Chia thành các nhóm nhỏ nếu có nhiều ảnh
      const uploadResults = [];
      const chunkSize = 3; // Tải lên tối đa 3 ảnh mỗi lần

      for (let i = 0; i < processedFiles.length; i += chunkSize) {
        const chunk = processedFiles.slice(i, i + chunkSize);
        console.log(`Đang tải lên nhóm ảnh ${i / chunkSize + 1}/${Math.ceil(processedFiles.length / chunkSize)}...`);

        const formData = new FormData();
        chunk.forEach(file => {
          formData.append('files', file);
        });

        const response = await api.post('/images/upload-multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds
        });

        // Xử lý kết quả từ server
        const chunkResults = Array.isArray(response.data) ? response.data : response.data.data;

        if (!Array.isArray(chunkResults)) {
          console.error("Invalid response format:", chunkResults);
          throw new Error("Expected array of images but got: " + typeof chunkResults);
        }

        uploadResults.push(...chunkResults);
      }

      console.log("Tất cả ảnh đã được tải lên thành công:", uploadResults.length);
      return uploadResults;
    } catch (error: any) {
      console.error('Lỗi upload ảnh:', error);

      if (error.response) {
        console.error('Chi tiết lỗi:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }

      throw error;
    }
  },

  /**
   * Upload an image for the SunEditor
   */
  uploadEditorImage: async (file: File, compress: boolean = true): Promise<ImageResponse> => {
    const formData = new FormData();

    try {
      // Nén ảnh nếu được yêu cầu
      const processedFile = compress ? await imageService.compressImage(file) : file;
      formData.append('file', processedFile);

      const response = await api.post('/images/sunEditor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error uploading editor image:", error);
      throw error;
    }
  },

  /**
   * Get all images
   */
  getAllImages: async (): Promise<ImageResponse[]> => {
    const response = await api.get('/images');
    return response.data;
  },

  /**
   * Delete an image by slug
   */
  deleteImage: async (slug: string): Promise<any> => {
    const response = await api.delete(`/images/${slug}`);
    return response.data;
  },
};

export default imageService;