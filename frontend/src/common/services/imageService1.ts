import api from '../utils/api';

export const uploadImage = async (file: File, userId: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);

    const response = await api.post('/images/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
