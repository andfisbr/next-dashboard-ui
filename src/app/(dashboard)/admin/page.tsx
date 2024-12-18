//
//
//
import Announcements from "@/components/Announcements"
import AttendanceChart from "@/components/AttendanceChart"
import CountChart from "@/components/CountChart"
import EventCalendar from "@/components/EventCalendar"
import FinanceChart from "@/components/FinanceChart"
import InfoCard from "@/components/InfoCard"


const AdminPage = () => {
        return (
                <div className="p-4 flex gap-4 flex-col md:flex-row">
                        {/* LEFT */}
                        <div className="w-full lg:w-2/3 flex flex-col gap-8">
                                {/* INFO CARDS */}
                                <div className="flex gap-4 justify-between flex-wrap">
                                        <InfoCard type="student" />
                                        <InfoCard type="teacher" />
                                        <InfoCard type="parent" />
                                        <InfoCard type="staff" />
                                </div>

                                {/* MIDDLE CHARTS */}
                                <div className="flex gap-4 flex-col lg:flex-row">
                                        {/* COUNT CHART */}
                                        <div className="w-full lg:w-1/3 h-[450px]">
                                                <CountChart />
                                        </div>

                                        {/* ATTENDANCE CHART */}
                                        <div className="w-full lg:w-2/3 h-[450px]">
                                                <AttendanceChart />
                                        </div>
                                </div>

                                {/* BOTTOM CHARTS */}
                                <div className="w-full h-[500px]">
                                        <FinanceChart />
                                </div>
                        </div>

                        {/* RIGHT */}
                        <div className="w-full lg:w-1/3 flex flex-col gap-8">
                                <div className="">
                                        <EventCalendar />
                                        <Announcements />
                                </div>
                        </div>
                </div>
        )
}


export default AdminPage
