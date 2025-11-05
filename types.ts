export interface FormData {
  fullName: string;
  age: string;
  dni: string;
  phone: string;
  address: string;
  socialMedia: string;
  currentActivity: string;
  answers: {
    customerService: (string | undefined)[];
    salesAptitude: (string | undefined)[];
    motivation: string;
  };
}

export interface InterviewQuestions {
  customerService: string[];
  salesAptitude: string[];
}
