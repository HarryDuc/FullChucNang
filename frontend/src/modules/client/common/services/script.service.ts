import axios from 'axios';

export enum ScriptPosition {
  HEADER = 'header',
  MAIN = 'main',
  FOOTER = 'footer',
}

export interface IScript {
  _id: string;
  name: string;
  content: string;
  position: ScriptPosition;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScriptDto {
  name: string;
  content: string;
  position: ScriptPosition;
  description?: string;
}

export interface UpdateScriptDto {
  name?: string;
  content?: string;
  position?: ScriptPosition;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const ScriptService = {
  async getAllScripts(): Promise<IScript[]> {
    const response = await axios.get(`${API_URL}/scripts`);
    return response.data;
  },

  async getScriptsBySection(): Promise<Record<ScriptPosition, IScript[]>> {
    const response = await axios.get(`${API_URL}/scripts/sections`);
    return response.data;
  },

  async getScriptsByPosition(position: ScriptPosition): Promise<IScript[]> {
    const response = await axios.get(`${API_URL}/scripts/position/${position}`);
    return response.data;
  },

  async getScriptById(id: string): Promise<IScript> {
    const response = await axios.get(`${API_URL}/scripts/${id}`);
    return response.data;
  },

  async createScript(data: CreateScriptDto): Promise<IScript> {
    const response = await axios.post(`${API_URL}/scripts`, data);
    return response.data;
  },

  async updateScript(id: string, data: UpdateScriptDto): Promise<IScript> {
    const response = await axios.patch(`${API_URL}/scripts/${id}`, data);
    return response.data;
  },

  async deleteScript(id: string): Promise<IScript> {
    const response = await axios.delete(`${API_URL}/scripts/${id}`);
    return response.data;
  },

  async toggleScriptActive(id: string): Promise<IScript> {
    const response = await axios.patch(`${API_URL}/scripts/${id}/toggle`);
    return response.data;
  },
};