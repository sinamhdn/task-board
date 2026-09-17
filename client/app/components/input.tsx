import cn from "classnames";
import { AnimatePresence } from "framer-motion";

import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import type { ErrorState } from "~/state/errorSlice";
import { findInputError, isFormInvalid } from "~/utils";
import InputError from "./input-error";

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm: string;
  board_name: string;
  board_member_email: string;
  list_name: string;
};

type InputPropsType = {
  id: string;
  name: keyof FormValues;
  type?: string;
  label: string;
  validation: any;
  placeholder?: string;
  multiline?: boolean;
  errors: ErrorState;
  classNameContainerTW: string;
  classNameInputContainerTW: string;
  classNameLableTW: string;
  classNameTextAreaTW: string;
  classNameInputTW: string;
  classNameContainer: string;
  classNameInputContainer: string;
  classNameLable: string;
  classNameTextArea: string;
  classNameInput: string;
};

export const Input = ({
  id,
  name,
  type = "text",
  label,
  placeholder,
  validation,
  multiline = false,
  errors,
  classNameContainerTW,
  classNameInputContainerTW,
  classNameLableTW,
  classNameTextAreaTW,
  classNameInputTW,
  classNameContainer,
  classNameInputContainer,
  classNameLable,
  classNameTextArea,
  classNameInput,
}: InputPropsType) => {
  const {
    register,
    formState: { errors: formStateErrors },
  } = useFormContext<FormValues>();

  const inputError = findInputError(formStateErrors, name);
  const isInvalid = isFormInvalid(inputError);
  const hasAuthFieldErrors = !!errors.auth_field_errors[name];
  const shouldShowError = isInvalid || hasAuthFieldErrors;

  return (
    <div
      className={cn(
        twMerge("input-field flex flex-col w-full gap-2", classNameContainerTW),
        classNameContainer,
      )}
    >
      <div
        className={cn(
          twMerge("text-left", classNameInputContainerTW),
          classNameInputContainer,
        )}
      >
        <label
          htmlFor={id}
          className={cn(
            twMerge("font-semibold capitalize", classNameLableTW),
            classNameLable,
          )}
        >
          {label}
        </label>
        {multiline ? (
          <textarea
            id={id}
            className={cn(
              twMerge(
                "p-5 font-medium rounded-md w-full border border-slate-300 placeholder:opacity-60 min-h-[10rem] max-h-[20rem] resize-y",
                classNameTextAreaTW,
              ),
              classNameTextArea,
            )}
            placeholder={placeholder}
            {...register(`${name}`, validation)}
          ></textarea>
        ) : (
          <input
            className={cn(
              twMerge(
                "w-full p-4 font-medium border rounded-md border-slate-300 placeholder:opacity-60 mb-2 mt-2",
                classNameInputTW,
              ),
              classNameInput,
            )}
            id={id}
            type={type}
            placeholder={placeholder}
            {...register(name, validation)}
          />
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {shouldShowError && (
          <InputError
            field={name}
            errors={errors}
            formStateErrors={formStateErrors}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
