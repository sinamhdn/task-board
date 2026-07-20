import { useDispatch } from "react-redux";
import type { Route } from "./+types/signup";
import { useRef, useState } from "react";
import { signupUser } from "~/state/sessionSlice";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Signup" }, { name: "description", content: "Signup!" }];
}

function Signup() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_comfirm: ''
  });

  // use Ref instead of use State to prevent rerender on every input change
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const passConfirmRef = useRef<HTMLInputElement>(null);
  const refData = {
    first_name: firstNameRef.current?.value || '',
    last_name: lastNameRef.current?.value || '',
    email: emailRef.current?.value || '',
    password: passRef.current?.value || '',
    password_confirm: passConfirmRef.current?.value || '',
  }

  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(state => ({
      ...state, [name]: value
    }));
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    dispatch(signupUser(formData))
  }

  return <div className="signup-component">
    <form className="signup-form" onSubmit={handleSubmit}>
      <div className="input-field">
        <label htmlFor="first-name-input">First Name</label>
        <input id="first-name-input" type="text" name="first_name" value={formData.first_name} onChange={handleChange} ref={firstNameRef} />
      </div>
      <div className="input-field">
        <label htmlFor="last-name-input">Last Name</label>
        <input id="last-name-input" type="text" name="last_name" value={formData.last_name} onChange={handleChange} ref={lastNameRef} />
      </div>
      <div className="input-field">
        <label htmlFor="email-input">Email</label>
        <input id="email-input" type="text" name="email" value={formData.email} onChange={handleChange} ref={emailRef} />
      </div>
      <div className="input-field">
        <label htmlFor="password-input">Password</label>
        <input id="password-input" type="text" name="password" value={formData.password} onChange={handleChange} ref={passRef} />
      </div>
      <div className="input-field">
        <label htmlFor="password_comfirm-input">Confirm Password</label>
        <input id="password_comfirm-input" type="text" name="password_comfirm" value={formData.password_comfirm} onChange={handleChange} ref={passConfirmRef} />
      </div>
      <div className="submit-button">
        <button type="submit">Register</button>
      </div>
    </form>
  </div>;
}

export default Signup;

// {* formEncType is needed for imageupload *}
