const env = import.meta.env;

export const appConfig = {
  maxUploadBytes: Number(env.VITE_MAX_UPLOAD_BYTES ?? 8 * 1024 * 1024),
};
