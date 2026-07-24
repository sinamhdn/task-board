import type { Route } from "./+types/signup";
import { useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { LoadingStatus, setError, signupUser } from "~/state/sessionSlice";
import { useAppDispatch } from "~/state/hooks";
import type { RootState } from "~/state/store";
import { Input } from "~/components/input";
import {
  first_name_validation,
  last_name_validation,
  email_validation,
  password_validation,
  confirm_validation,
} from "~/utils/inputValidations";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Signup" }, { name: "description", content: "Signup!" }];
}

function Signup() {
  const loadingState = useSelector((state: RootState) => state.session.status);
  const sessionErrors = useSelector(
    (errors: RootState) => errors.session.errors,
  );
  const dispatch = useAppDispatch();

  interface FormValues {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm: string;
  }

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
    await dispatch(
      signupUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      }),
    );
  };

  const onSubmit = methods.handleSubmit(handleSubmitCallback);
  const pass_field = methods.watch("password");

  return (
    <div className="signup-page">
      <FormProvider {...methods}>
        <form className="signup-form" noValidate onSubmit={onSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
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
      </FormProvider>
    </div>
  );
}

export default Signup;

// {* formEncType is needed for imageupload *}
