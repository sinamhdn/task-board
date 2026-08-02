// import { useSelector } from "react-redux";
import type { Route } from "./+types/signin";
import type { RootState } from "~/state/store";
import { useForm, FormProvider } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { LoadingStatus, signinUser, clearError } from "~/state/sessionSlice";
import { Input } from "~/components/input";
import { Link, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import {
  email_validation,
  password_validation,
} from "~/utils/input/inputValidations";
import { setToken } from "~/utils/auth";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Signin" }, { name: "description", content: "Signin!" }];
}

function Signin() {
  const loadingState = useAppSelector(
    (state: RootState) => state.session.authStatus,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
    try {
      const result = await dispatch(
        signinUser({
          email: data.email,
          password: data.password,
        }),
      ).unwrap();
      setToken(result.access_token);
      dispatch(clearError());
      throw navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const sessionErrors = useAppSelector(
    (errors: RootState) => errors.session.errors,
  );

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  return (
    <div className="signin-component p-10">
      <FormProvider {...methods}>
        <form
          className="signup-form xl:w-1/4 lg:w-1/2 sm:w-full mx-auto text-center"
          noValidate
          onSubmit={onSubmit}
        >
          <div className="grid gap-5">
            <Input {...email_validation} sessionErrors={sessionErrors} />
            <Input {...password_validation} sessionErrors={sessionErrors} />
          </div>
          <div className="submit-button mt-5 mb-5">
            <button
              type="submit"
              className="flex items-center justify-center gap-1 p-5 mx-auto font-semibold w-48 text-center text-white bg-blue-600 rounded-md hover:bg-blue-800"
            >
              <GrMail />
              {loadingState === LoadingStatus.pending
                ? "Signing in..."
                : "Login"}
            </button>
          </div>
          <Link to="/signup">Register</Link>
        </form>
      </FormProvider>
    </div>
  );
}

export default Signin;
