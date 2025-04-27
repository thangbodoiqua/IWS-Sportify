const DashboardCard = ({ icon, label, value }) => (
    <div className="bg-[#1f1f1f] w-[50%] p-4 rounded-lg flex items-center gap-4 shadow border border-gray-700">
      {icon}
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <h3 className="text-2xl text-white font-semibold">{value}</h3>
      </div>
    </div>
  );
  export default DashboardCard;