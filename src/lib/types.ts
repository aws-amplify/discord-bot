export type QuestionListByTagProps = {
  groupedQuestions: object;
};

export type GroupedQuestions = {
  tag: string;
  items: Array<Record<string, string | Array<string>>>;
};

export type BarChartViewProps = {
  data: object;
};
