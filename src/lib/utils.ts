//
//
//
import { cookies } from "next/headers"


let role: string = ""
let userId: string = ""


export const getRole = () => {
        role = cookies().get("X-User-Role")?.value || "default"
        return role
}


export const getUserId = () => {
        userId = cookies().get("X-User-ID")?.value || "-1"
        return userId
}




const currentWorkWeek = () => {
        const today = new Date()
        const dayOfWeek = today.getDay()

        const startOfWeek = new Date(today)

        if (dayOfWeek === 0) {
                startOfWeek.setDate(today.getDate() + 1)
        }

        if (dayOfWeek === 6) {
                startOfWeek.setDate(today.getDate() + 2)
        } else {
                startOfWeek.setDate(today.getDate() - (dayOfWeek - 1))
        }
        startOfWeek.setHours(0, 0, 0, 0)


        return startOfWeek
}

export const adjustScheduleToCurrentWeek = (
        lessons: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {

        const startOfWeek = currentWorkWeek()


        return lessons.map(it => {
                const lessonDayOfWeek = it.start.getDay()

                const daysFromMonday = lessonDayOfWeek === 0
                        ? 6
                        : lessonDayOfWeek - 1


                const adjustedStartDate = new Date(startOfWeek)
                adjustedStartDate.setDate(startOfWeek.getDate() + daysFromMonday)
                adjustedStartDate.setHours(
                        it.start.getHours(),
                        it.start.getMinutes(),
                        it.start.getSeconds(),
                        it.start.getMilliseconds()
                )

                const adjustedEndDate = new Date(adjustedStartDate)
                adjustedEndDate.setHours(
                        it.end.getHours(),
                        it.end.getMinutes(),
                        it.end.getSeconds(),
                        it.end.getMilliseconds()
                )

                return {
                        title: it.title,
                        start: adjustedStartDate,
                        end: adjustedEndDate
                }
        })
}
