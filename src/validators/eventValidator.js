const { check, validationResult, matchedData } = require("express-validator");

const postValidationRules = () => {
  return [
    check("name")
      .isString()
      .trim()
      .not()
      .isEmpty()
      .withMessage("name is required")
      .isLength({ max: 255 })
      .withMessage("Event name must be no more than 255 characters"),
    check("start_event_date")
      .not()
      .isEmpty()
      .withMessage("start_event_date is required")
      .isISO8601()
      .toDate()
      .withMessage("Start event date must be a date and with format DDMMYYYY"),
    check("registration_start_date")
      .not()
      .isEmpty()
      .withMessage("registration_start_date is required")
      .isISO8601()
      .toDate()
      .withMessage(
        "Start registration date must be a date and with format DDMMYYYY"
      ),
    check("registration_end_date")
      .not()
      .isEmpty()
      .withMessage("registration_end_date is required")
      .isISO8601()
      .toDate()
      .withMessage(
        "End registration date must be a date and with format DDMMYYYY"
      ),
    check("end_event_date")
      .not()
      .isEmpty()
      .withMessage("end_event_date is required")
      .isISO8601()
      .toDate()
      .withMessage("End event date must be a date and with format DDMMYYYY"),
    check("start_event_time")
      .not()
      .isEmpty()
      .matches(/^(?:[01]\d|2[0-3])[0-5]\d$/)
      .withMessage("Start event time must be a time and with format HHMM."),
    check("end_event_time")
      .not()
      .isEmpty()
      .matches(/^(?:[01]\d|2[0-3])[0-5]\d$/)
      .withMessage("End event time must be a time and with format HHMM."),
    check("registration_start_time")
      .not()
      .isEmpty()
      .matches(/^(?:[01]\d|2[0-3])[0-5]\d$/)
      .withMessage(
        "Start registration time must be a time and with format HHMM."
      ),
    check("registration_end_time")
      .not()
      .isEmpty()
      .matches(/^(?:[01]\d|2[0-3])[0-5]\d$/)
      .withMessage(
        "End registration time must be a time and with format HHMM."
      ),
    check("body").isString().not().isEmpty().withMessage("name is required"),
    check("snippets")
      .escape()
      .isString()
      .not()
      .isEmpty()
      .withMessage("snippets is required")
      .custom((value) => {
        if (value.split(" ").length > 20) {
          throw new Error("The snippets can't be longer than 20 words");
        }
        return true;
      }),
    check("link_registration")
      .isString()
      .trim()
      .not()
      .isEmpty()
      .withMessage("link registration is required")
      .matches(/^https:\/\/.*/)
      .withMessage(
        "The registration link must be a link that will be evidenced by the presence of https:// in it"
      ),
    check("location")
      .escape()
      .isString()
      .not()
      .isEmpty()
      .withMessage("location is required"),
  ];
};

//  .isDate({ format: 'DDMMYYYY' })

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).json({ status: 500, errors: errors.array() });
  }

  req.body = matchedData(req, { onlyValidData: true });
  next();
};

module.exports = {
  postValidationRules,
  validate,
};
