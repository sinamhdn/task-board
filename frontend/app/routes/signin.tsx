import type { Route } from "./+types/signin";
import { useSelector } from "react-redux";
import type { RootState } from "~/state/store";
import { useForm, FormProvider } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { LoadingStatus, signinUser } from "~/state/sessionSlice";
import { Input } from "~/components/input";
import { Link } from "react-router";
import { useAppDispatch } from "~/state/hooks";
import {
  email_validation,
  password_validation,
} from "~/utils/inputValidations";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Signin" }, { name: "description", content: "Signin!" }];
}

function Signin() {
  const loadingState = useSelector((state: RootState) => state.session.status);
  const dispatch = useAppDispatch();

  interface FormValues {
    email: string;
    password: string;
  }

  const methods = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const handleSubmitCallback = async (data: FormValues) => {
    await dispatch(
      signinUser({
        email: data.email,
        password: data.password,
      }),
    );
  };

  const sessionErrors = useSelector(
    (errors: RootState) => errors.session.errors,
  );

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  return (
    <div className="signin-component">
      <FormProvider {...methods}>
        <form className="signup-form" noValidate onSubmit={onSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <Input {...email_validation} sessionErrors={sessionErrors} />
            <Input {...password_validation} sessionErrors={sessionErrors} />
          </div>
          <div className="submit-button mt-5">
            <button
              type="submit"
              className="flex items-center gap-1 p-5 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-800"
            >
              <GrMail />
              {loadingState === LoadingStatus.pending
                ? "Signing up..."
                : "Register"}
            </button>
          </div>
        </form>
        <Link to="/signup">Login</Link>
      </FormProvider>
    </div>
  );
}

export default Signin;
