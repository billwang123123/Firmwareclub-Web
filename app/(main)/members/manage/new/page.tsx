import { MemberEditor } from "@/components/members/member-editor";

export const metadata = { title: "添加成员" };

export default function NewMemberPage() {
  return <MemberEditor mode="create" />;
}
