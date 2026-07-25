import { useState } from "react";
import type { CreateProjectFormState } from "../model/types";
import { createProjectFormDefaultState } from "./consts";
import { useCreateProjectApi } from "../api/useCreateProjectApi";
import type { FormikConfig } from "formik";

export const useCreateProjectForm = (onClose: () => void) => {
  const [initialValues] = useState<CreateProjectFormState>(
    () => createProjectFormDefaultState,
  );

  const { mutateAsync, isPending } = useCreateProjectApi();

  const submitForm: FormikConfig<CreateProjectFormState>['onSubmit'] =
    async (values) => {
      await mutateAsync(values);
      onClose();
    };
  return {
    initialValues,
    submitForm,
    isPending,
  };
}