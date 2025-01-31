import { getDashBoardCourses } from "@/actions/get-dashboard-courses";
import { CoursesList } from "@/components/courses-list";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CheckCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { InfoCard } from "./_components/info-card";

export default async function DashBoard() {
  const { userId } = auth();
  if (!userId) {
    return redirect("/lms");
  }
  const { completedCourses, coursesInProgress } = await getDashBoardCourses(
    userId
  );
  return (
    <div className="p-6 space-y-4 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
        icon={Clock}
        label="In Progress"
        numberOfItems = {coursesInProgress.length}
        />
        <InfoCard
        icon={CheckCircle}
        label="Completed"
        numberOfItems = {completedCourses.length}
        variant = "success"
        />
      </div>
      <CoursesList items={[...coursesInProgress, ...completedCourses]} />
    </div>
  );
}
