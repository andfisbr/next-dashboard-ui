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
import { getRole } from "@/lib/utils"
import { Class, Prisma, Teacher } from "@prisma/client"
import Image from "next/image"


type ClassList = Class & { supervisor: Teacher }




const ClassListPage = async ({
        searchParams,
}: {
        searchParams: { [key: string]: string | undefined };
}) => {

        const columns = [
                {
                        header: "Class name",
                        accessor: "name",
                },
                {
                        header: "Capacity",
                        accessor: "capacity",
                        className: "hidden md:table-cell",
                },
                {
                        header: "Grade",
                        accessor: "grade",
                        className: "hidden md:table-cell",
                },
                {
                        header: "Supervisor",
                        accessor: "supervisor",
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


        const renderRow = (item: ClassList) => {
                return (
                        <tr key={item.id} className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-lamaPurpleLight">
                                <td className="flex items-center gap-4 p-4">
                                        {item.name}
                                </td>
                                <td className="hidden md:table-cell">
                                        {item.capacity}
                                </td>
                                <td className="hidden md:table-cell">
                                        {item.name[0]}
                                </td>
                                <td className="hidden md:table-cell">
                                        {item.supervisor.name + " " + item.supervisor.surname}
                                </td>
                                <td>
                                        <div className="flex items-center gap-2">
                                                {getRole() === "admin" && (
                                                        <>
                                                                <FormContainer table="class" type="update" data={item} />
                                                                <FormContainer table="class" type="delete" id={item.id} />
                                                        </>
                                                )}
                                        </div>
                                </td>
                        </tr>
                )
        }


        const { page, ...queryParams } = searchParams;
        const p = page ? parseInt(page) : 1;

        const query: Prisma.ClassWhereInput = {}

        if (queryParams) {
                for (const [key, value] of Object.entries(queryParams)) {
                        if (value === undefined) {
                                continue
                        }

                        switch (key) {
                                case "search":
                                        query.name = { contains: value, mode: "insensitive" }
                                        break

                                case "supervisorId":
                                        query.supervisorId = value

                                default:
                                        break
                        }
                }
        }


        const [data, count] = await prisma.$transaction([
                prisma.class.findMany({
                        where: query,
                        include: {
                                supervisor: true,
                        },
                        take: ITEMS_PER_PAGE,
                        skip: ITEMS_PER_PAGE * (p - 1),
                }),

                prisma.class.count({
                        where: query
                })
        ])


        return (
                <div className="bg-white p-4 rounded-md flex-1 m-4- mt-0">
                        {/* TOP */}
                        <div className="flex items-center justify-between">
                                <div className="hidden md:block text-lg font-semibold">
                                        All classes
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
                                                        <FormContainer table="class" type="create" />
                                                )}
                                        </div>
                                </div>
                        </div>

                        {/* LIST */}
                        <Table columns={columns} renderRow={renderRow} data={data} />

                        {/* PAGINATION */}
                        <Pagination page={p} count={count} />
                </div>
        )
}


export default ClassListPage
