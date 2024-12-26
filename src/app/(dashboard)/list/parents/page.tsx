//
//
//
import FormModal from "@/components/FormModal"
import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import prisma from "@/lib/prisma"
import { ITEMS_PER_PAGE } from "@/lib/settings"
import { getRole } from "@/lib/utils"
import { Parent, Prisma, Student } from "@prisma/client"
import Image from "next/image"


type ParentList = Parent & { students: Student[] }


const columns = [
        {
                header: "Info",
                accessor: "info",
        },
        {
                header: "Students name",
                accessor: "students",
                className: "hidden md:table-cell",
        },
        {
                header: "Phone",
                accessor: "phone",
                className: "hidden lg:table-cell",
        },
        {
                header: "Address",
                accessor: "address",
                className: "hidden lg:table-cell",
        },
        ...(
                getRole() === "admin"
                        ? [{
                                header: "Actions",
                                accessor: "action",
                        }]
                        : []
        )
]


const renderRow = (item: ParentList) => {
        return (
                <tr key={item.id} className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-lamaPurpleLight">
                        <td className="flex items-center gap-4 p-4">
                                <div className="flex flex-col">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-xs to-gray-500">{item?.email}</p>
                                </div>
                        </td>
                        <td className="hidden md:table-cell">{item.students.map(s => s.name).join(",")}</td>
                        <td className="hidden lg:table-cell">{item.phone}</td>
                        <td className="hidden lg:table-cell">{item.address}</td>
                        <td>
                                <div className="flex items-center gap-2">
                                        {getRole() === "admin" && (
                                                <>
                                                <FormModal table="parent" type="update" data={item} />
                                                <FormModal table="parent" type="delete" id={item.id} />
                                                </>
                                        )}
                                </div>
                        </td>
                </tr>
        )
}


const ParentListPage = async ({
        searchParams,
}: {
        searchParams: { [key: string]: string | undefined };
}) => {

        const { page, ...queryParams } = searchParams;
        const p = page ? parseInt(page) : 1;

        const query: Prisma.ParentWhereInput = {}

        if (queryParams) {
                for (const [key, value] of Object.entries(queryParams)) {
                        if (value === undefined) {
                                continue
                        }

                        switch (key) {
                                case "search":
                                        query.name = { contains: value, mode: "insensitive" }
                                        break

                                default:
                                        break
                        }
                }
        }


        const [data, count] = await prisma.$transaction([
                prisma.parent.findMany({
                        where: query,
                        include: {
                                students: true,
                        },
                        take: ITEMS_PER_PAGE,
                        skip: ITEMS_PER_PAGE * (p - 1),
                }),

                prisma.parent.count({
                        where: query
                })
        ])


        return (
                <div className="bg-white p-4 rounded-md flex-1 m-4- mt-0">
                        {/* TOP */}
                        <div className="flex items-center justify-between">
                                <div className="hidden md:block text-lg font-semibold">
                                        All parents ({count})
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
                                                {getRole() === "admin" &&
                                                        <FormModal table="parent" type="create" />
                                                }
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


export default ParentListPage
