import type { Route } from "./+types/signup";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { LoadingStatus, signupUser } from "~/state/sessionSlice";
import { useAppDispatch } from "~/state/hooks";
import type { RootState } from "~/state/store";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Signup" }, { name: "description", content: "Signup!" }];
}

function Signup() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirm: "",
    server_error: "",
  });

  const loadingState = useSelector((state: RootState) => state.user.status);

  // let passwordsMatch = false;
  // formData.password === formData.password_confirm;

  // use Ref instead of State to prevent rerender on every input change
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const passConfirmRef = useRef<HTMLInputElement>(null);
  const refData = {
    first_name: firstNameRef.current?.value || "",
    last_name: lastNameRef.current?.value || "",
    email: emailRef.current?.value || "",
    password: passRef.current?.value || "",
    password_confirm: passConfirmRef.current?.value || "",
  };

  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((state) => {
      const newstate = {
        ...state,
        [name]: value,
      };

      if (
        newstate.password &&
        newstate.password_confirm &&
        newstate.password != newstate.password_confirm
      ) {
        setErrors((errors) => ({
          ...errors,
          password_confirm: "Passwords don't match.",
        }));
      } else {
        setErrors({
          ...errors,
          password_confirm: "",
        });
      }

      return newstate;
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        signupUser({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        }),
      ).unwrap();
      console.log("Success:", result);
      // Navigate or show success message
    } catch (error: any) {
      // Display the error message
      if (typeof error === "string") {
        setErrors((errors) => ({ ...errors, server_error: error }));
      } else if (error?.message) {
        setErrors((errors) => ({ ...errors, server_error: error.message }));
      } else {
        setErrors((errors) => ({
          ...errors,
          server_error: "An unknown error occurred",
        }));
      }
    }
  };

  return (
    <div className="signup-component">
      <form className="signup-form" onSubmit={handleSubmit}>
        {errors.server_error && (
          <div className="error-message" style={{ color: "red" }}>
            {errors.server_error}
          </div>
        )}
        <div className="input-field">
          <label htmlFor="first-name-input">First Name</label>
          <input
            id="first-name-input"
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            ref={firstNameRef}
          />
          {errors.first_name && errors.first_name.length != 0 && (
            <p className="form-error first_name-field-error">
              {errors.first_name}
            </p>
          )}
        </div>
        <div className="input-field">
          <label htmlFor="last-name-input">Last Name</label>
          <input
            id="last-name-input"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            ref={lastNameRef}
          />
          {errors.last_name && errors.last_name.length != 0 && (
            <p className="form-error last_name-field-error">
              {errors.last_name}
            </p>
          )}
        </div>
        <div className="input-field">
          <label htmlFor="email-input">Email</label>
          <input
            id="email-input"
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            ref={emailRef}
          />
          {errors.email && errors.email.length != 0 && (
            <p className="form-error email-field-error">{errors.email}</p>
          )}
        </div>
        <div className="input-field">
          <label htmlFor="password-input">Password</label>
          <input
            id="password-input"
            type="text"
            name="password"
            value={formData.password}
            onChange={handleChange}
            ref={passRef}
          />
          {errors.password && errors.password.length != 0 && (
            <p className="form-error password-field-error">{errors.password}</p>
          )}
        </div>
        <div className="input-field">
          <label htmlFor="password_confirm-input">Confirm Password</label>
          <input
            id="password_confirm-input"
            type="text"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            ref={passConfirmRef}
          />
          {errors.password_confirm && errors.password_confirm.length != 0 && (
            <p className="form-error password-confirm-field-error">
              {errors.password_confirm}
            </p>
          )}
        </div>
        <div className="submit-button">
          <button type="submit">
            {loadingState === LoadingStatus.pending
              ? "Signing up..."
              : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Signup;

// {* formEncType is needed for imageupload *}
