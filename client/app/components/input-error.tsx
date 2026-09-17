import { motion } from "framer-motion";
import type { FieldErrors } from "react-hook-form";
import { MdError } from "react-icons/md";
import type { AuthFormErrorInterface } from "~/state/errorSlice";

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
}: {
  field: keyof FormValues;
  errors: ErrorState;
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
        errors.auth_field_errors[field as keyof AuthFormErrorInterface] && (
          <p className="form-error first_name-field-error">
            {errors.auth_field_errors[field as keyof AuthFormErrorInterface]}
          </p>
        )
      )}
    </motion.div>
  </div>
);

export default InputError;
