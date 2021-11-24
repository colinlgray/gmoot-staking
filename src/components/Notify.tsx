import { useSnackbar, VariantType } from "notistack";
import { useCallback } from "react";

export function useNotify() {
  const { enqueueSnackbar } = useSnackbar();
  return useCallback(
    (variant: VariantType, message: string) => {
      enqueueSnackbar(message, { variant });
    },
    [enqueueSnackbar]
  );
}
