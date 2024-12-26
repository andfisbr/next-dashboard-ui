//
//
//
import FormContainer from "@/components/FormContainer"
import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import prisma from "@/lib/prisma"
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { getRole, getUserId } from "@/lib/utils"
import { Class, Event, Prisma } from "@prisma/client"
import Image from "next/image"


type EventList = Event & { class: Class }


const EventListPage = async ({
        searchParams,
}: {
        searchParams: { [key: string]: string | undefined };
}) => {

        const columns = [
                {
                        header: "Title",
                        accessor: "title",
                },
                {
                        header: "Class",
                        accessor: "class",
                        className: "hidden md:table-cell",
                },
                {
                        header: "Date",
                        accessor: "date",
                        className: "hidden md:table-cell",
                },
                {
                        header: "Start Time",
                        accessor: "startTime",
                        className: "hidden md:table-cell",
                },
                {
                        header: "End Time",
                        accessor: "endTime",
                        className: "hidden md:table-cell",
                },
                ...(
                        getRole() === "admin"
                                ? [{
                                        header: "Actions",
                                        accessor: "action",
                                }]
                                : []
                ),
        ]


        const renderRow = (item: EventList) => {
                return (
                        <tr key={item.id} className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-lamaPurpleLight">
                                <td className="flex items-center gap-4 p-4">
                                        {item.title}
                                </td>
                                <td className="hidden md:table-cell">
                                        {item.class?.name || "-"}
                                </td>
                                <td className="hidden md:table-cell">
                                        {new Intl.DateTimeFormat("pt-BR").format(item.startTime)}
                                </td>
                                <td className="hidden md:table-cell">
                                        {item.startTime.toLocaleTimeString("pt-BR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: false,
                                        })}
                                </td>
                                <td className="hidden md:table-cell">
                                        {item.endTime.toLocaleTimeString("pt-BR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: false,
                                        })}
                                </td>
                                <td>
                                        <div className="flex items-center gap-2">
                                                {getRole() === "admin" && (
                                                        <>
                                                                <FormContainer table="event" type="update" data={item} />
                                                                <FormContainer table="event" type="delete" id={item.id} />
                                                        </>
                                                )}
                                        </div>
                                </td>
                        </tr>
                )
        }


        const { page, ...queryParams } = searchParams;
        const p = page ? parseInt(page) : 1;

        const query: Prisma.EventWhereInput = {}

        if (queryParams) {
                for (const [key, value] of Object.entries(queryParams)) {
                        if (value === undefined) {
                                continue
                        }

                        switch (key) {
                                case "search":
                                        query.title = { contains: value, mode: "insensitive" }
                                        break

                                default:
                                        break
                        }
                }
        }


        // ROLE CONDITIONS
        const roleConditions = {
                teacher: { lessons: { some: { teacherId: getUserId() } } },
                student: { students: { some: { id: getUserId() } } },
                parent: { students: { some: { parentId: getUserId() } } },
        }
        query.OR = [
                { classId: null },
                { class: roleConditions[getRole() as keyof typeof roleConditions] || {} }
        ]


        switch (getRole()) {
                case "admin":
                        break

                case "teacher":
                        query.OR = [
                                { classId: null },
                                {}
                        ]
        }

        const [data, count] = await prisma.$transaction([
                prisma.event.findMany({
                        where: query,
                        include: {
                                class: true
                        },
                        take: ITEMS_PER_PAGE,
                        skip: ITEMS_PER_PAGE * (p - 1),
                }),

                prisma.event.count({
                        where: query
                })
        ])


        return (
                <div className="bg-white p-4 rounded-md flex-1 m-4- mt-0">
                        {/* TOP */}
                        <div className="flex items-center justify-between">
                                <div className="hidden md:block text-lg font-semibold">
                                        All events ({count})
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                                        <TableSearch />
                                        <div className="flex items-center gap-4 self-end">
                                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow ">
                                                        <Image src="/filter.png" alt="" width={14} height={14} />
                                                </button>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow ">
                                                        <Image src="/sort.png" alt="" width={14} height={14} />
                                                </button>
                                                {getRole() === "admin" && (
                                                        <FormContainer table="event" type="create" />
                                                )}
                                        </div>
                                </div>
                        </div>

                        {/* LIST */}
                        <Table columns={columns} renderRow={renderRow} data={data} />

                        {/* PAGINATION */}
                        <Pagination page={p} count={count}/>
                </div>
        )
}


export default EventListPage
