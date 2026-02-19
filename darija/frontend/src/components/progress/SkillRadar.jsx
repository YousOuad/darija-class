import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function SkillRadar({ skills = {} }) {
  const data = [
    { subject: 'Vocabulary', value: skills.vocabulary || 0, fullMark: 100 },
    { subject: 'Grammar', value: skills.grammar || 0, fullMark: 100 },
    { subject: 'Phrases', value: skills.phrases || 0, fullMark: 100 },
    { subject: 'Culture', value: skills.culture || 0, fullMark: 100 },
    { subject: 'Conversation', value: skills.conversation || 0, fullMark: 100 },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md border border-sand-100">
      <h3 className="font-bold text-dark mb-4">Skill Breakdown</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#E9C46A" strokeOpacity={0.3} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#1A1A2E', fontSize: 12, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9e9eb7', fontSize: 10 }}
            />
            <Radar
              name="Skills"
              dataKey="value"
              stroke="#2A9D8F"
              fill="#2A9D8F"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
