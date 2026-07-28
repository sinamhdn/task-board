import { useFormContext } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { MdError } from "react-icons/md";
import type { SessionErrors } from "~/state/sessionSlice";
import { findInputError, isFormInvalid } from "~/utils";
import cn from "classnames";

type InputPropsType = {
  id: string;
  name: keyof FormValues;
  type?: string;
  label: string;
  validation: any;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  sessionErrors: SessionErrors;
};

type FormValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm: string;
};

export const Input = ({
  id,
  name,
  type = "text",
  label,
  placeholder,
  validation,
  multiline = false,
  className,
  sessionErrors,
}: InputPropsType) => {
  const {
    register,
    formState: { errors: formStateErrors },
  } = useFormContext<FormValues>();

  const inputError = findInputError(formStateErrors, name);
  const isInvalid = isFormInvalid(inputError);
  const hasSessionErrors = !!sessionErrors[name];
  const shouldShowError = isInvalid || hasSessionErrors;
  const input_tailwind =
    "p-5 font-medium rounded-md w-full border border-slate-300 placeholder:opacity-60";

  return (
    <div className={cn("input-field flex flex-col w-full gap-2", className)}>
      <div className=" text-left">
        <label htmlFor={id} className="font-semibold capitalize">
          {label}
        </label>
        {multiline ? (
          <textarea
            id={id}
            className={cn(
              input_tailwind,
              "min-h-[10rem] max-h-[20rem] resize-y",
            )}
            placeholder={placeholder}
            {...register(`${name}`, validation)}
          ></textarea>
        ) : (
          <input
            className="w-full p-4 font-medium border rounded-md border-slate-300 placeholder:opacity-60 mb-2 mt-2"
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
            sessionErrors={sessionErrors}
            formStateErrors={formStateErrors}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const InputError = ({
  field,
  sessionErrors,
  formStateErrors,
}: {
  field: keyof FormValues;
  sessionErrors: SessionErrors;
  formStateErrors: FieldErrors<FormValues>;
}) => (
  <div className="form-error-container">
    <motion.div
      className="flex items-center gap-1 px-2 font-semibold text-red-500 bg-red-100 rounded-md"
      {...framerError}
    >
      <MdError />
      {formStateErrors[field] ? (
        <p className="form-error first_name-field-error">
          {formStateErrors[field]?.message}
        </p>
      ) : (
        sessionErrors[field as keyof SessionErrors] && (
          <p className="form-error first_name-field-error">
            {sessionErrors[field as keyof SessionErrors]}
          </p>
        )
      )}
    </motion.div>
  </div>
);

const framerError = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
};
