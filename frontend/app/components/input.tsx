import { useFormContext } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { MdError } from "react-icons/md";
import type { SessionErrors } from "~/state/sessionSlice";
import { findInputError, isFormInvalid } from "~/utils";

type InputPropsType = {
  id: string;
  name: keyof FormValues;
  type?: string;
  label: string;
  validation: any;
  placeholder?: string;
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

  return (
    <div className="input-field flex flex-col w-full gap-2">
      <div className="flex justify-between">
        <label htmlFor={id} className="font-semibold capitalize">
          {label}
        </label>
        <input
          className="w-full p-5 font-medium border rounded-md border-slate-300 placeholder:opacity-60"
          id={id}
          type={type}
          placeholder={placeholder}
          {...register(name, validation)}
        />
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
