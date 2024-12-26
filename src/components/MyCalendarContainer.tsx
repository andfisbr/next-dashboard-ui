//
//
//
import prisma from "@/lib/prisma"
import MyCalendar from "./MyCalendar"
import { adjustScheduleToCurrentWeek } from "@/lib/utils"



const MyCalendarContainer = async ({
        type,
        id
}: {
        type: "teacherId" | "classId"
        id: number | string
}) => {

        const resData = await prisma.lesson.findMany({
                where: {
                        ...(type === "teacherId"
                                ? { teacherId: id as string }
                                : { classId: id as number }
                        ),
                }
        })

        const data = resData.map(lesson => ({
                title: lesson.name,
                start: lesson.startTime,
                end: lesson.endTime,
        }))


        const schedule = adjustScheduleToCurrentWeek(data)

        return (
                <div className="">
                        <MyCalendar data={schedule} />
                </div>
        )
}


export default MyCalendarContainer
