import { ChapterHeading } from "../orbital/chapter";
export { Chapter, ChapterHeading, ChapterLoading, EmptyState } from "../orbital/chapter";
export default function HelloTitle({ mainText, supportiveText }: { mainText: string; supportiveText: string }) {
  return <ChapterHeading label="NASA archive" title={mainText} description={supportiveText} />;
}
