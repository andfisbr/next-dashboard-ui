//
//
//
import Announcements from "@/components/Announcements"
import MyCalendarContainer from "@/components/MyCalendarContainer"
import prisma from "@/lib/prisma"
import { getUserId } from "@/lib/utils"


const ParentPage = async () => {

        const students = await prisma.student.findMany({
                where: {
                        parentId: getUserId()
                }
        })


        return (
                <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">

                        {/* LEFT */}
                        <div className="">
                                {students.map((student) => (
                                        <div className="w-full xl:w-2/3 flex flex-col gap-8" key={student.id}>
                                                <div className="h-full bg-white p-4 rounded-md">
                                                        <h1 className="text-xl font-semibold">
                                                                Schedule | {student.name +  " " + student.surname}
                                                        </h1>
                                                        <MyCalendarContainer type="classId" id={student.classId} />
                                                </div>
                                        </div>
                                ))}
                        </div>

                        {/* RIGHT */}
                        <div className="w-full xl:w-1/3 flex flex-col gap-8">
                                <Announcements />
                        </div>
                </div>
        )
}


export default ParentPage
