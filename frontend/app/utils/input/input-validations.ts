export const first_name_validation = {
  name: "first_name" as const,
  label: "Fist Name",
  type: "text",
  id: "first_name",
  placeholder: "enter your first name ...",
  validation: {
    required: {
      value: true,
      message: "required",
    },
    maxLength: {
      value: 30,
      message: "30 characters max",
    },
  },
};

export const last_name_validation = {
  name: "last_name" as const,
  label: "Last Name",
  type: "text",
  id: "last_name",
  placeholder: "enter your last name ...",
  validation: {
    required: {
      value: true,
      message: "required",
    },
    maxLength: {
      value: 30,
      message: "30 characters max",
    },
  },
};

export const email_validation = {
  name: "email" as const,
  label: "Email",
  type: "email",
  id: "email",
  placeholder: "enter your email address ...",
  validation: {
    required: {
      value: true,
      message: "required",
    },
    pattern: {
      value:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: "not valid",
    },
  },
};

export const password_validation = {
  name: "password" as const,
  label: "Password",
  type: "password",
  id: "password",
  placeholder: "type password ...",
  validation: {
    required: {
      value: true,
      message: "required",
    },
    minLength: {
      value: 6,
      message: "min 8 characters",
    },
  },
};

export const confirm_validation = {
  name: "confirm" as const,
  label: "Confirm Password",
  type: "password",
  id: "confirm",
  placeholder: "type password again ...",
  validation: {
    required: {
      value: true,
      message: "required",
    },
    minLength: {
      value: 6,
      message: "min 6 characters",
    },
  },
};

export const desc_validation = {
  name: "description" as const,
  label: "description",
  multiline: true,
  id: "description",
  placeholder: "write description ...",
  validation: {
    required: {
      value: true,
      message: "required",
    },
    maxLength: {
      value: 200,
      message: "200 characters max",
    },
  },
};

export const num_validation = {
  name: "num" as const,
  label: "number",
  type: "number",
  id: "num",
  placeholder: "write a random number",
  validation: {
    required: {
      value: true,
      message: "required",
    },
  },
};

export const board_name_validation = {
  name: "board_name" as const,
  label: "Board name",
  type: "text",
  id: "board_name",
  placeholder: "enter a name for your board",
  validation: {
    required: {
      value: true,
      message: "required",
    },
  },
};

export const board_member_email_validation = {
  name: "board_member_email" as const,
  label: "",
  type: "email",
  id: "board_member_email",
  placeholder: "enter email address of the member you want to add ...",
  validation: {
    required: {
      value: true,
      message: "required",
    },
    pattern: {
      value:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: "not valid",
    },
  },
};
