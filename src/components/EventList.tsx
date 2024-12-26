//
//

import prisma from "@/lib/prisma"

//
const EventList = async ({
        dateParam,
}: {
        dateParam: string | undefined
}) => {


        if (dateParam) {
                if (isValidDate(dateParam)) {
                        console.log("isvalid: " + dateParam)
                        const [day, month, year] = dateParam.split("/")
                        dateParam = `${month}/${day}/${year}`
                        console.log("isvalid: " + dateParam)
                }
        }


        const date = dateParam
                ? new Date(dateParam)
                : new Date()

        const data = await prisma.event.findMany({
                where: {
                        startTime: {
                                gte: new Date(date.setHours(0, 0, 0, 0)),
                                lte: new Date(date.setHours(23, 59, 59, 999))
                        }
                }
        })



        return data.map(event => (
                <div
                        className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-lamaSky even:border-t-lamaPurple"
                        key={event.id}
                >
                        <div className="flex items-center justify-between">
                                <h1 className="font-semibold text-gray-600">{event.title}</h1>
                                <span className="text-gray-300 text-xs">{event.startTime.toLocaleTimeString('pt-BR', {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false
                                })}</span>
                        </div>
                        <p className="mt-2 text-gray-400 text-sm">
                                {event.description}
                        </p>
                </div>
        ))
}




const isValidDate = (dateStr: string): boolean => {
        const [day, month, year] = dateStr.split("/").map(Number)

        if (month < 1 || month > 12) {
                return false
        }

        if (day < 1 || day > 31) {
                return false
        }

        if ([4, 6, 9, 11].includes(month) && day > 30) {
                return false
        }

        if (month === 2) {
                const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
                if (day > (isLeapYear ? 29 : 28)) {
                        return false
                }
        }

        return true
}





export default EventList
