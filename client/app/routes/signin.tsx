// import { useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import bg from "~/assets/log-bg.webp";
import BackgroundImage from "~/components/background-image";
import { Input } from "~/components/input";
import { LoadingStatusEnum } from "~/state";
import { clearError } from "~/state/error-slice";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { signinUser } from "~/state/session-slice";
import type { RootState } from "~/state/store";
import { setTokenCookie } from "~/utils/auth";
import {
  email_validation,
  password_validation,
} from "~/utils/input/input-validations";
import log from "~/utils/logger";
import type { Route } from "./+types/signin";

const logger = log.getLogger("signin logger");
logger.setLevel(import.meta.env.DEV ? "debug" : "warn");

interface FormValues {
  email: string;
  password: string;
}

export function meta({ matches }: Route.MetaArgs) {
  // Find the root match
  const rootMatch = matches.find((match) => match?.id === "root");
  // Extract the root's meta descriptors (if any)
  const rootMeta = rootMatch?.meta ?? [];
  // Define this route's meta
  const pageMeta = [
    { title: "Signin" },
    { name: "description", content: "Signin!" },
  ];
  // Merge: root first, then page-specific (page wins on duplicates)
  return [...rootMeta, ...pageMeta];
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
      setTokenCookie(result.access_token);
      dispatch(clearError());
      navigate("/");
    } catch (err) {
      logger.error("signin: dispatch error while signing in user ---> ", err);
    }
  };

  const errors = useAppSelector((state: RootState) => state.errorSlice.errors);

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  return (
    <div>
      <BackgroundImage src={bg} alt="Coast Background Image" />
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
                className="flex items-center justify-center gap-1 p-2 mx-auto font-semibold w-48 text-center text-white bg-blue-600/50 hover:bg-blue-800/50 cursor-pointer backdrop-blur-lg"
              >
                {/* <GrMail /> */}
                {authLoadingStatus === LoadingStatusEnum.pending
                  ? "Signing in..."
                  : "Login"}
              </button>
            </div>
            <Link to="/signup">Register</Link>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default Signin;
