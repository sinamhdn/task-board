// import { useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import { GrMail } from "react-icons/gr";
import { Link, useNavigate } from "react-router";
import bg from "~/assets/log-bg.webp";
import BackgroundImage from "~/components/background-image";
import { Input } from "~/components/input";
import { LoadingStatusEnum } from "~/state";
import { clearError } from "~/state/error-slice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { signupUser } from "~/state/session-slice";
import type { RootState } from "~/state/store";
import {
  confirm_validation,
  email_validation,
  first_name_validation,
  last_name_validation,
  password_validation,
} from "~/utils/input/input-validations";
import log from "~/utils/logger";
import type { Route } from "./+types/signup";

const logger = log.getLogger("signup logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm: string;
}

export function meta({ matches }: Route.MetaArgs) {
  // Find the root match
  const rootMatch = matches.find((match) => match?.id === "root");
  // Extract the root's meta descriptors (if any)
  const rootMeta = rootMatch?.meta ?? [];
  // Define this route's meta
  const pageMeta = [
    { title: "Signup" },
    { name: "description", content: "Signup!" },
  ];
  // Merge: root first, then page-specific (page wins on duplicates)
  return [...rootMeta, ...pageMeta];
}

function Signup() {
  const loadingState = useAppSelector(
    (state: RootState) => state.sessionSlice.authStatus,
  );
  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);
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
      logger.error("signup: dispatch error while signing up user ---> ", err);
    }
  };

  const onSubmit = methods.handleSubmit(handleSubmitCallback);
  const pass_field = methods.watch("password");

  return (
    <div>
      <BackgroundImage src={bg} alt="Coast Background Image" />
      <div className="signup-page p-10">
        <FormProvider {...methods}>
          <form
            className="signup-form xl:w-1/4 lg:w-1/2 sm:w-full mx-auto text-center"
            noValidate
            onSubmit={onSubmit}
          >
            <div className="grid gap-5">
              <Input {...first_name_validation} errors={errors} />
              <Input {...last_name_validation} errors={errors} />
              <Input {...email_validation} errors={errors} />
              <Input {...password_validation} errors={errors} />
              <Input
                {...confirm_validation}
                validation={{
                  ...confirm_validation.validation,
                  validate: (value: string) =>
                    value === pass_field || "Passwords do not match",
                }}
                errors={errors}
              />
            </div>
            <div className="submit-button mt-5 mb-5">
              <button
                type="submit"
                className="flex items-center justify-center gap-1 p-2 mx-auto font-semibold w-48 text-center text-white bg-blue-600/50 hover:bg-blue-800/50 cursor-pointer backdrop-blur-lg"
              >
                {/* <GrMail /> */}
                {loadingState === LoadingStatusEnum.pending
                  ? "Signing up..."
                  : "Register"}
              </button>
            </div>
            <Link to="/signin">Login</Link>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default Signup;

// {* formEncType is needed for imageupload *}
