import { Dumbbell } from 'lucide-react';

const VIDEOS = [
  { id: 'Iga0h0p6DcI', title: 'Belly Fat Workout For Men | Belly Workout At Home | Belly Burn Workout | Cult Fit | CureFit' },
  { id: 'QLBT4-iN2yg', title: 'The Insane effects Sprinting has on the Body!' },
  { id: 'DVD_gIdPr-o', title: '30 Min Cardio HIIT Workout at home - 5000 steps for Fat Burn (No equipment)' },
  { id: 'ibywaQB3L7o', title: '5 Minute Belly Fat Workout! Burn Fat Fast At Home' },
];

function VideoEmbed({ id, title }) {
  return (
    <div>
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        ></iframe>
      </div>
      <div className="flex items-center justify-between gap-2 mt-1">
        <p className="text-sm text-muted">{title}</p>
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand hover:underline whitespace-nowrap"
        >
          Watch on YouTube
        </a>
      </div>
    </div>
  );
}

export default function ExerciseSection() {
  return (
    <div className="bg-surface p-6 rounded-xl shadow-md mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="h-5 w-5 text-brand" />
        <h2 className="text-xl font-semibold">Exercise Videos</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {VIDEOS.map((video) => (
          <VideoEmbed key={video.id} id={video.id} title={video.title} />
        ))}
      </div>
    </div>
  );
}
