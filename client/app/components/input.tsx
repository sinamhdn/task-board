import cn from "classnames";
import { AnimatePresence } from "framer-motion";

import { motion } from "framer-motion";
import type { FieldErrors } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { MdError } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import type { AuthFormErrorInterface, ErrorStateInterface } from "~/state";
import { findInputError, isFormInvalid } from "~/utils";

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm: string;
  board_name: string;
  board_member_email: string;
  list_name: string;
  card_name: string;
};

type InputPropsType = {
  id: string;
  name: keyof FormValues;
  type?: string;
  label: string;
  validation: any;
  placeholder?: string;
  multiline?: boolean;
  errors: ErrorStateInterface;
  classNameContainerTW?: string;
  classNameInputContainerTW?: string;
  classNameLableTW?: string;
  classNameTextAreaTW?: string;
  classNameInputTW?: string;
  classNameErrorContainerTW?: string;
  classNameContainer?: string;
  classNameInputContainer?: string;
  classNameLable?: string;
  classNameTextArea?: string;
  classNameInput?: string;
  classNameErrorContainer?: string;
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
  classNameContainerTW = "",
  classNameInputContainerTW = "",
  classNameLableTW = "",
  classNameTextAreaTW = "",
  classNameInputTW = "",
  classNameErrorContainerTW = "",
  classNameContainer = "",
  classNameInputContainer = "",
  classNameLable = "",
  classNameTextArea = "",
  classNameInput = "",
  classNameErrorContainer = "",
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
            classNameContainerTW={classNameErrorContainerTW}
            classNameContainer={classNameErrorContainer}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const framerError = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
};

const InputError = ({
  field,
  errors,
  formStateErrors,
  classNameContainerTW = "",
  classNameContainer = "",
}: {
  field: keyof FormValues;
  errors: ErrorStateInterface;
  formStateErrors: FieldErrors<FormValues>;
  classNameContainerTW?: string;
  classNameContainer?: string;
}) => (
  <div className="form-error-container">
    <motion.div
      className={cn(
        twMerge(
          "flex items-center gap-1 px-2 font-semibold text-red-500 bg-red-100 rounded-md",
          classNameContainerTW,
        ),
        classNameContainer,
      )}
      {...framerError}
    >
      <MdError />
      {formStateErrors[field] ? (
        <p className="form-error first_name-field-error">
          {formStateErrors[field]?.message}
        </p>
      ) : (
        errors.auth_field_errors[field as keyof AuthFormErrorInterface] && (
          <p className="form-error first_name-field-error">
            {errors.auth_field_errors[field as keyof AuthFormErrorInterface]}
          </p>
        )
      )}
    </motion.div>
  </div>
);
