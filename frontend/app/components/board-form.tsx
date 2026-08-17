import { useForm, FormProvider } from "react-hook-form";

function BoardForm({ handleCancelClick }: { handleCancelClick: () => void }) {
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

  const methods = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = methods.handleSubmit(handleSubmitCallback);

  return (
    <div className="board-add-form-component">
      <h4>New Board</h4>
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

export default BoardForm;
