import React from "react";
import { Star, ThumbsUp, Users, Play, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InstructorProfilePage = () => {
	// Placeholder data - replace with your actual data
	const instructor = {
		name: "Dr. Sarah Johnson",
		title: "Senior Web Development Instructor",
		avatar: "https://imgs.search.brave.com/4XB-Gk2q9IBAWidxcYNJ0vz4byZt1_SpUDiBbQYi1Jg/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/bW9zLmNtcy5mdXR1/cmVjZG4ubmV0L0hu/TUJIQ0JOMno2YlRK/dHVLdms4ZlEtMzIw/LTgwLmpwZw",
		bio: "Experienced web developer with 10+ years in full-stack development. Passionate about teaching and helping others learn to code.",
		expertise: ["Web Development", "React", "Node.js", "Python"],
		stats: {
			students: 15000,
			reviews: 2800,
			rating: 4.8,
		}
	};
	
	const courses = [
		{
			title: "Complete React Development",
			students: 5200,
			rating: 4.9,
			reviews: 850,
			duration: "20 hours",
			image: "/api/placeholder/280/160"
		},
		{
			title: "Advanced JavaScript Patterns",
			students: 3800,
			rating: 4.7,
			reviews: 620,
			duration: "15 hours",
			image: "/api/placeholder/280/160"
		}
	];
	
	const reviews = [
		{
			user: "Alex M.",
			rating: 5,
			date: "2 days ago",
			comment: "Excellent instructor! Clear explanations and great practical examples.",
			helpful: 45
		},
		{
			user: "Sarah P.",
			rating: 5,
			date: "1 week ago",
			comment: "The course content was well-structured and the instructor was very responsive to questions.",
			helpful: 38
		}
	];
	
	
	
	return (
		<div className="max-w-6xl mx-auto p-6 space-y-8">
			{/* Instructor Header */}
			<div className="flex flex-col md:flex-row gap-6 items-start">
				<img
					src={instructor.avatar}
					alt={instructor.name}
					className="rounded-full w-32 h-32 object-cover"
				/>
				<div className="space-y-4 flex-1">
					<div>
						<h1 className="text-3xl font-bold">{instructor.name}</h1>
						<p className="text-xl text-gray-600">{instructor.title}</p>
					</div>
					
					<div className="flex gap-4 text-sm">
						<div className="flex items-center gap-1">
							<Users className="w-4 h-4" />
							<span>{instructor.stats.students.toLocaleString()} students</span>
						</div>
						<div className="flex items-center gap-1">
							<Star className="w-4 h-4" />
							<span>{instructor.stats.rating} rating</span>
						</div>
						<div className="flex items-center gap-1">
							<ThumbsUp className="w-4 h-4" />
							<span>{instructor.stats.reviews.toLocaleString()} reviews</span>
						</div>
					</div>
					
					<p className="text-gray-700">{instructor.bio}</p>
					
					<div className="flex flex-wrap gap-2">
						{instructor.expertise.map((skill) => (
							<span
								key={skill}
								className="px-3 py-1 bg-gray-100 rounded-full text-sm"
							>
                {skill}
              </span>
						))}
					</div>
				</div>
			</div>
			
			{/* Courses Section */}
			<section className="space-y-4">
				<h2 className="text-2xl font-bold">Courses</h2>
				<div className="grid md:grid-cols-2 gap-6">
					{courses.map((course) => (
						<Card key={course.title}>
							<img
								src={course.image}
								alt={course.title}
								className="w-full h-40 object-cover"
							/>
							<CardContent className="p-4 space-y-4">
								<h3 className="text-xl font-semibold">{course.title}</h3>
								<div className="flex flex-wrap gap-4 text-sm text-gray-600">
									<div className="flex items-center gap-1">
										<Users className="w-4 h-4" />
										<span>{course.students.toLocaleString()} students</span>
									</div>
									<div className="flex items-center gap-1">
										<Star className="w-4 h-4" />
										<span>{course.rating}</span>
									</div>
									<div className="flex items-center gap-1">
										<Clock className="w-4 h-4" />
										<span>{course.duration}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
			
			{/* Reviews Section */}
			<section className="space-y-4">
				<h2 className="text-2xl font-bold">Student Reviews</h2>
				<div className="space-y-4">
					{reviews.map((review) => (
						<Card key={review.user}>
							<CardContent className="p-4 space-y-2">
								<div className="flex justify-between items-center">
									<div className="font-semibold">{review.user}</div>
									<div className="text-sm text-gray-500">{review.date}</div>
								</div>
								<div className="flex items-center gap-1">
									{[...Array(review.rating)].map((_, i) => (
										<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
									))}
								</div>
								<p className="text-gray-700">{review.comment}</p>
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<ThumbsUp className="w-4 h-4" />
									<span>{review.helpful} found this helpful</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
};

export default InstructorProfilePage;