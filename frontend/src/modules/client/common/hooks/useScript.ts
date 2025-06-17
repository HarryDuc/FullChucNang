import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScriptService, IScript, CreateScriptDto, UpdateScriptDto, ScriptPosition } from '../services/script.service';

export const SCRIPT_KEYS = {
  all: ['scripts'] as const,
  lists: () => [...SCRIPT_KEYS.all, 'list'] as const,
  list: (filters: string) => [...SCRIPT_KEYS.lists(), { filters }] as const,
  sections: () => [...SCRIPT_KEYS.all, 'sections'] as const,
  position: (position: ScriptPosition) => [...SCRIPT_KEYS.all, 'position', position] as const,
  details: () => [...SCRIPT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SCRIPT_KEYS.details(), id] as const,
};

export const useScripts = () => {
  return useQuery({
    queryKey: SCRIPT_KEYS.lists(),
    queryFn: () => ScriptService.getAllScripts(),
  });
};

export const useScriptsBySection = () => {
  return useQuery({
    queryKey: SCRIPT_KEYS.sections(),
    queryFn: () => ScriptService.getScriptsBySection(),
  });
};

export const useScriptsByPosition = (position: ScriptPosition) => {
  return useQuery({
    queryKey: SCRIPT_KEYS.position(position),
    queryFn: () => ScriptService.getScriptsByPosition(position),
  });
};

export const useScript = (id: string) => {
  return useQuery({
    queryKey: SCRIPT_KEYS.detail(id),
    queryFn: () => ScriptService.getScriptById(id),
    enabled: !!id,
  });
};

export const useCreateScript = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScriptDto) => ScriptService.createScript(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.sections() });
    },
  });
};

export const useUpdateScript = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScriptDto }) =>
      ScriptService.updateScript(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.sections() });
    },
  });
};

export const useDeleteScript = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ScriptService.deleteScript(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.sections() });
    },
  });
};

export const useToggleScriptActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ScriptService.toggleScriptActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SCRIPT_KEYS.sections() });
    },
  });
};