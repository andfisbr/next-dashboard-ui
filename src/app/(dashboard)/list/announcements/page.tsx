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
import { Announcement, Class, Prisma } from "@prisma/client"
import Image from "next/image"


type AnnouncementList = Announcement & { class: Class }



const AnnouncementListPage = async ({
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
                ...(
                        getRole() === "admin"
                                ? [{
                                        header: "Actions",
                                        accessor: "action",
                                }]
                                : []
                ),
        ]



        const renderRow = async (item: AnnouncementList) => {
                return (
                        <tr key={item.id} className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-lamaPurpleLight">
                                <td className="flex items-center gap-4 p-4">
                                        {item.title}
                                </td>
                                <td>
                                        {item.class?.name || "-"}
                                </td>
                                <td className="hidden md:table-cell">
                                        {new Intl.DateTimeFormat("pt-BR").format(item.date)}
                                </td>
                                <td>
                                        <div className="flex items-center gap-2">
                                                {getRole() === "admin" && (
                                                        <>
                                                                <FormContainer table="announcement" type="update" data={item} />
                                                                <FormContainer table="announcement" type="delete" id={item.id} />
                                                        </>
                                                )}
                                        </div>
                                </td>
                        </tr>
                )
        }


        const { page, ...queryParams } = searchParams;
        const p = page ? parseInt(page) : 1;


        const query: Prisma.AnnouncementWhereInput = {}


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



        const [data, count] = await prisma.$transaction([
                prisma.announcement.findMany({
                        where: query,
                        include: {
                                class: true
                        },
                        take: ITEMS_PER_PAGE,
                        skip: ITEMS_PER_PAGE * (p - 1),
                }),

                prisma.announcement.count({
                        where: query
                })
        ])



        return (
                <div className="bg-white p-4 rounded-md flex-1 m-4- mt-0">

                        {/* TOP */}
                        <div className="flex items-center justify-between">
                                <div className="hidden md:block text-lg font-semibold">
                                        All announcements ({count})
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
                                                        <FormContainer table="announcement" type="create" />
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


export default AnnouncementListPage
