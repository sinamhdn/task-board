// import { useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { Link, useNavigate } from "react-router";
import { Input } from "~/components/input";
import { LoadingStatusEnum } from "~/state";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { signinUser } from "~/state/sessionSlice";
import type { RootState } from "~/state/store";
import { setToken } from "~/utils/auth";
import {
  email_validation,
  password_validation,
} from "~/utils/input/input-validations";
import type { Route } from "./+types/signin";

interface FormValues {
  email: string;
  password: string;
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Signin" }, { name: "description", content: "Signin!" }];
}

function Signin() {
  const authLoadingStatus = useAppSelector(
    (state: RootState) => state.sessionSlice.authStatus,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);

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
            <Input {...email_validation} errors={errors} />
            <Input {...password_validation} errors={errors} />
          </div>
          <div className="submit-button mt-5 mb-5">
            <button
              type="submit"
              className="flex items-center justify-center gap-1 p-5 mx-auto font-semibold w-48 text-center text-white bg-blue-600 rounded-md hover:bg-blue-800"
            >
              <GrMail />
              {authLoadingStatus === LoadingStatusEnum.pending
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
