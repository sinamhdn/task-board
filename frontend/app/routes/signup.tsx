import { FormProvider, useForm } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { useSelector } from "react-redux";
import { Link } from "react-router";
import { Input } from "~/components/input";
import { useAppDispatch } from "~/state/hooks";
import { LoadingStatus, signupUser, clearError } from "~/state/sessionSlice";
import type { RootState } from "~/state/store";
import { useNavigate } from "react-router";
import {
  confirm_validation,
  email_validation,
  first_name_validation,
  last_name_validation,
  password_validation,
} from "~/utils/input/inputValidations";
import type { Route } from "./+types/signup";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Signup" }, { name: "description", content: "Signup!" }];
}

function Signup() {
  interface FormValues {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm: string;
  }
  const loadingState = useSelector(
    (state: RootState) => state.session.authStatus,
  );
  const sessionErrors = useSelector(
    (errors: RootState) => errors.session.errors,
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const methods = useForm<FormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm: "",
    },
    mode: "onChange",
  });

  const handleSubmitCallback = async (data: FormValues) => {
    try {
      await dispatch(
        signupUser({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          password: data.password,
        }),
      ).unwrap();
      dispatch(clearError());
      throw navigate("/signin");
    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit = methods.handleSubmit(handleSubmitCallback);
  const pass_field = methods.watch("password");

  return (
    <div className="signup-page p-10">
      <FormProvider {...methods}>
        <form
          className="signup-form xl:w-1/4 lg:w-1/2 sm:w-full mx-auto text-center"
          noValidate
          onSubmit={onSubmit}
        >
          <div className="grid gap-5">
            <Input {...first_name_validation} sessionErrors={sessionErrors} />
            <Input {...last_name_validation} sessionErrors={sessionErrors} />
            <Input {...email_validation} sessionErrors={sessionErrors} />
            <Input {...password_validation} sessionErrors={sessionErrors} />
            <Input
              {...confirm_validation}
              validation={{
                ...confirm_validation.validation,
                validate: (value: string) =>
                  value === pass_field || "Passwords do not match",
              }}
              sessionErrors={sessionErrors}
            />
          </div>
          <div className="submit-button mt-5 mb-5">
            <button
              type="submit"
              className="flex items-center justify-center gap-1 p-5 mx-auto font-semibold w-48 text-center text-white bg-blue-600 rounded-md hover:bg-blue-800"
            >
              <GrMail />
              {loadingState === LoadingStatus.pending
                ? "Signing up..."
                : "Register"}
            </button>
          </div>
          <Link to="/signin">Login</Link>
        </form>
      </FormProvider>
    </div>
  );
}

export default Signup;

// {* formEncType is needed for imageupload *}
