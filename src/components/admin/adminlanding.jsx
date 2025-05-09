import React, { useState, useEffect, useRef } from 'react';
import { Card, Spinner, Button, Badge } from 'flowbite-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { HiUsers, HiDocumentText, HiStar, HiAcademicCap, HiDownload, HiTrendingUp } from 'react-icons/hi';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminLanding() {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    userCount: 0,
    postCount: 0,
    reviewCount: 0,
    courseCount: 0,
    recentUserGrowth: [],
    postsByCategory: [],
    reviewsRatingDistribution: [],
    coursesByCategory: [],
    averageRating: 0,
    activeUsers: 0,
    recentActivity: []
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [generatingReport, setGeneratingReport] = useState(false);
  const userChartRef = useRef(null);
  const postChartRef = useRef(null);
  const reviewChartRef = useRef(null);
  const courseChartRef = useRef(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.token) return;
      
      setLoading(true);
      try {
        // Fetch stats in parallel
        const [usersResponse, postsResponse, reviewsResponse, coursesResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/user/all', { 
            headers: { Authorization: `Bearer ${currentUser.token}` }
          }),
          axios.get('http://localhost:8080/api/posts', { 
            headers: { Authorization: `Bearer ${currentUser.token}` }
          }),
          axios.get('http://localhost:8080/api/reviews', { 
            headers: { Authorization: `Bearer ${currentUser.token}` }
          }),
          axios.get('http://localhost:8080/api/learns', { 
            headers: { Authorization: `Bearer ${currentUser.token}` }
          })
        ]);

        // Process user data to get growth over time
        const users = usersResponse.data;
        const posts = postsResponse.data;
        const reviews = reviewsResponse.data;
        const courses = coursesResponse.data;
        
        // Calculate monthly user growth (last 6 months)
        const userGrowthData = processUserGrowth(users);
        
        // Process posts by category
        const postsCategories = processPostCategories(posts);
        
        // Process review ratings distribution
        const reviewRatings = processReviewRatings(reviews);
        
        // Process course categories
        const courseCategories = processCourseCategories(courses);

        // Calculate average rating
        const avgRating = calculateAverageRating(reviews);

        // Calculate active users (simplified - users who joined in the last 30 days)
        const activeUsersCount = calculateActiveUsers(users);

        // Recent activity (simplified - latest 5 actions across the platform)
        const recentActivity = getRecentActivity(users, posts, reviews);
        
        setStats({
          userCount: users.length,
          postCount: posts.length,
          reviewCount: reviews.length,
          courseCount: courses.length,
          recentUserGrowth: userGrowthData,
          postsByCategory: postsCategories,
          reviewsRatingDistribution: reviewRatings,
          coursesByCategory: courseCategories,
          averageRating: avgRating,
          activeUsers: activeUsersCount,
          recentActivity: recentActivity
        });

      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Calculate average rating
  const calculateAverageRating = (reviews) => {
    if (!reviews.length) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  // Calculate active users
  const calculateActiveUsers = (users) => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return users.filter(user => {
      if (!user.createdAt) return false;
      return new Date(user.createdAt) >= thirtyDaysAgo;
    }).length;
  };

  // Get recent activity
  const getRecentActivity = (users, posts, reviews) => {
    const activities = [];
    
    // Add latest users
    users.slice(0, 3).forEach(user => {
      activities.push({
        type: 'user',
        text: `${user.username} joined the platform`,
        date: user.createdAt || new Date(),
        icon: 'user'
      });
    });
    
    // Add latest posts
    posts.slice(0, 3).forEach(post => {
      activities.push({
        type: 'post',
        text: `New post: "${post.title || 'Untitled'}"`,
        date: post.createdAt || new Date(),
        icon: 'post'
      });
    });
    
    // Add latest reviews
    reviews.slice(0, 3).forEach(review => {
      activities.push({
        type: 'review',
        text: `New ${review.rating}★ review from ${review.name || 'Anonymous'}`,
        date: review.createdAt || new Date(),
        icon: 'star'
      });
    });
    
    // Sort by date, most recent first
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  // Function to capture a specific chart
  const captureChart = async (chartRef) => {
    if (!chartRef.current) return null;
    
    try {
      // Wait a moment to ensure chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the chart element
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing chart:', error);
      return null;
    }
  };

  // Helper function to generate PDF report with chart screenshots
  const generateReport = async () => {
    if (generatingReport) return;
    
    setGeneratingReport(true);
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add a nice header with title
      pdf.setFillColor(59, 130, 246); // Blue header
      pdf.rect(0, 0, 210, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text('STRUCTURA PLATFORM STATISTICS', 105, 15, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      
      // Add report metadata
      pdf.setFontSize(12);
      pdf.text(`Generated on ${format(new Date(), 'PPpp')}`, 20, 35);
      pdf.text(`Generated by: ${currentUser.username}`, 20, 42);
      pdf.text(`Report period: All time statistics`, 20, 49);

      // Add summary section
      pdf.setFontSize(16);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Platform Summary', 20, 60);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text('This report provides an overview of key platform metrics and user activity.', 20, 67);

      // Key metrics table
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Key Metrics', 105, 80, { align: 'center' });
      
      const keyMetricsData = [
        ['Metric', 'Value', 'Description'],
        ['Total Users', stats.userCount.toString(), 'Total registered users on the platform'],
        ['Active Users (30d)', stats.activeUsers.toString(), 'Users who joined in the last 30 days'],
        ['Total Courses', stats.courseCount.toString(), 'Number of published courses'],
        ['Total Posts', stats.postCount.toString(), 'User-generated content posts'],
        ['Total Reviews', stats.reviewCount.toString(), 'Product and course reviews'],
        ['Average Rating', `${stats.averageRating} / 5`, 'Average platform rating']
      ];
      
      // Use autoTable instead of pdf.autoTable
      autoTable(pdf, {
        startY: 85,
        head: [keyMetricsData[0]],
        body: keyMetricsData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 5,
          fontSize: 10
        },
        columnStyles: {
          0: { fontStyle: 'bold' }
        }
      });
      
      // Reviews by rating table
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      let finalY = pdf.previousAutoTable ? pdf.previousAutoTable.finalY : 85;
      pdf.text('Reviews by Rating', 105, finalY + 20, { align: 'center' });
      
      // Calculate reviews by star rating
      const reviewsByRating = [1, 2, 3, 4, 5].map(rating => {
        const count = stats.reviewsRatingDistribution.counts?.[rating - 1] || 0;
        const percentage = stats.reviewCount > 0 
          ? ((count / stats.reviewCount) * 100).toFixed(1) 
          : '0.0';
        return [
          `${rating} Star`, 
          count.toString(), 
          `${percentage}%`, 
          rating >= 4 ? 'Positive' : rating === 3 ? 'Neutral' : 'Needs Improvement'
        ];
      });
      
      // Use autoTable directly 
      autoTable(pdf, {
        startY: finalY + 25,
        head: [['Rating', 'Count', 'Percentage', 'Sentiment']],
        body: reviewsByRating,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 159, 64],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 5,
          fontSize: 10
        }
      });

      // Add a page break
      pdf.addPage();
      
      // Add a nice header on the second page
      pdf.setFillColor(59, 130, 246); // Blue header
      pdf.rect(0, 0, 210, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('VISUALIZED DATA', 105, 10, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      
      // Capture all charts individually for better quality
      const userChartImg = await captureChart(userChartRef);
      const postChartImg = await captureChart(postChartRef);
      const reviewChartImg = await captureChart(reviewChartRef);
      const courseChartImg = await captureChart(courseChartRef);
      
      // Add the charts to the PDF
      let yPosition = 20;
      
      // User Growth Chart
      if (userChartImg) {
        pdf.setFontSize(14);
        pdf.setTextColor(59, 130, 246);
        pdf.text('User Growth (Last 6 Months)', 105, yPosition + 5, { align: 'center' });
        
        const imgWidth = 170;
        const imgHeight = 70;
        
        pdf.addImage(userChartImg, 'PNG', (pageWidth - imgWidth) / 2, yPosition + 10, imgWidth, imgHeight);
        yPosition += imgHeight + 25;
      }
      
      // Post Categories Chart
      if (postChartImg) {
        pdf.setFontSize(14);
        pdf.setTextColor(59, 130, 246);
        pdf.text('Posts by Category', 105, yPosition + 5, { align: 'center' });
        
        const imgWidth = 170;
        const imgHeight = 70;
        
        pdf.addImage(postChartImg, 'PNG', (pageWidth - imgWidth) / 2, yPosition + 10, imgWidth, imgHeight);
        yPosition += imgHeight + 25;
      }
      
      // Add a new page for more charts
      pdf.addPage();
      
      // Add header on the third page
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, 210, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('VISUALIZED DATA (CONTINUED)', 105, 10, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      yPosition = 20;
      
      // Review Rating Chart
      if (reviewChartImg) {
        pdf.setFontSize(14);
        pdf.setTextColor(59, 130, 246);
        pdf.text('Review Ratings Distribution', 105, yPosition + 5, { align: 'center' });
        
        const imgWidth = 130;
        const imgHeight = 80;
        
        pdf.addImage(reviewChartImg, 'PNG', (pageWidth - imgWidth) / 2, yPosition + 10, imgWidth, imgHeight);
        yPosition += imgHeight + 25;
      }
      
      // Course Categories Chart
      if (courseChartImg) {
        pdf.setFontSize(14);
        pdf.setTextColor(59, 130, 246);
        pdf.text('Courses by Category', 105, yPosition + 5, { align: 'center' });
        
        const imgWidth = 170;
        const imgHeight = 70;
        
        pdf.addImage(courseChartImg, 'PNG', (pageWidth - imgWidth) / 2, yPosition + 10, imgWidth, imgHeight);
      }
      
      // Add a page for detailed review analysis
      pdf.addPage();
      
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, 210, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('REVIEW ANALYSIS', 105, 10, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      
      // Review summary
      pdf.setFontSize(12);
      pdf.text(`Total Reviews: ${stats.reviewCount}`, 20, 30);
      pdf.text(`Average Rating: ${stats.averageRating} / 5`, 20, 38);
      
      if (stats.reviewCount > 0) {
        // Calculate sentiment percentages
        const positiveCount = (stats.reviewsRatingDistribution.counts?.[3] || 0) + (stats.reviewsRatingDistribution.counts?.[4] || 0);
        const neutralCount = stats.reviewsRatingDistribution.counts?.[2] || 0;
        const negativeCount = (stats.reviewsRatingDistribution.counts?.[0] || 0) + (stats.reviewsRatingDistribution.counts?.[1] || 0);
        
        const positivePercentage = ((positiveCount / stats.reviewCount) * 100).toFixed(1);
        const neutralPercentage = ((neutralCount / stats.reviewCount) * 100).toFixed(1);
        const negativePercentage = ((negativeCount / stats.reviewCount) * 100).toFixed(1);
        
        pdf.text(`Positive Reviews (4-5 stars): ${positiveCount} (${positivePercentage}%)`, 20, 46);
        pdf.text(`Neutral Reviews (3 stars): ${neutralCount} (${neutralPercentage}%)`, 20, 54);
        pdf.text(`Needs Improvement (1-2 stars): ${negativeCount} (${negativePercentage}%)`, 20, 62);
      }
      
      // Review details table
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.text('Detailed Rating Distribution', 105, 80, { align: 'center' });
      
      // Create detailed review data
      const detailedReviewData = [1, 2, 3, 4, 5].map(rating => {
        const count = stats.reviewsRatingDistribution.counts?.[rating - 1] || 0;
        const percentage = stats.reviewCount > 0 
          ? ((count / stats.reviewCount) * 100).toFixed(1) 
          : '0.0';
          
        let sentiment = '';
        if (rating >= 4) sentiment = 'Positive';
        else if (rating === 3) sentiment = 'Neutral';
        else sentiment = 'Needs Improvement';
        
        return [
          `${rating} Star${rating > 1 ? 's' : ''}`, 
          count.toString(), 
          `${percentage}%`, 
          sentiment,
          rating >= 4 ? '✓' : rating <= 2 ? '✗' : '-'
        ];
      });
      
      // Use autoTable directly
      autoTable(pdf, {
        startY: 85,
        head: [['Rating', 'Count', 'Percentage', 'Sentiment', 'Indicator']],
        body: detailedReviewData,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 159, 64],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          cellPadding: 5,
          fontSize: 10
        },
        columnStyles: {
          4: { halign: 'center' }
        }
      });
      
      // Recommendations based on ratings
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      finalY = pdf.previousAutoTable ? pdf.previousAutoTable.finalY : 85;
      pdf.text('Recommendations', 105, finalY + 20, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      
      const negativeRatingPercentage = stats.reviewCount > 0 
        ? (((stats.reviewsRatingDistribution.counts?.[0] || 0) + (stats.reviewsRatingDistribution.counts?.[1] || 0)) / stats.reviewCount * 100)
        : 0;
      
      let recommendationsText = '';
      
      if (negativeRatingPercentage > 20) {
        recommendationsText = 'Consider addressing customer concerns urgently. Over 20% of reviews indicate significant areas for improvement.';
      } else if (negativeRatingPercentage > 10) {
        recommendationsText = 'Moderate attention needed for customer satisfaction. Address the specific areas mentioned in lower ratings.';
      } else {
        recommendationsText = 'Customer satisfaction is good. Continue to maintain quality and monitor feedback for continuous improvement.';
      }
      
      const recommendationY = finalY + 30;
      const splitRecommendations = pdf.splitTextToSize(recommendationsText, pageWidth - 40);
      pdf.text(splitRecommendations, 20, recommendationY);
      
      // Add footer to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Report generated from Structura Admin Dashboard - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        pdf.text(`© ${new Date().getFullYear()} Structura. All rights reserved.`, 105, 295, { align: 'center' });
      }
      
      // Save the PDF
      pdf.save(`Structura_Analytics_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Helper functions to process data for charts
  const processUserGrowth = (users) => {
    // Get last 6 months
    const months = [];
    const counts = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(format(month, 'MMM yyyy'));
      
      const count = users.filter(user => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        return userDate.getMonth() === month.getMonth() && 
               userDate.getFullYear() === month.getFullYear();
      }).length;
      
      counts.push(count);
    }
    
    return { months, counts };
  };

  const processPostCategories = (posts) => {
    const categories = {};
    
    posts.forEach(post => {
      const category = post.postCategory || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return {
      labels: Object.keys(categories),
      counts: Object.values(categories)
    };
  };
  
  const processReviewRatings = (reviews) => {
    const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      if (review.rating && review.rating >= 1 && review.rating <= 5) {
        ratings[review.rating] = (ratings[review.rating] || 0) + 1;
      }
    });
    
    return {
      labels: Object.keys(ratings).map(r => `${r} Star`),
      counts: Object.values(ratings)
    };
  };
  
  const processCourseCategories = (courses) => {
    const categories = {};
    
    courses.forEach(course => {
      const category = course.learnCategory || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return {
      labels: Object.keys(categories),
      counts: Object.values(categories)
    };
  };

  // Chart data
  const userGrowthChart = {
    labels: stats.recentUserGrowth.months || [],
    datasets: [
      {
        label: 'New Users',
        data: stats.recentUserGrowth.counts || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const postCategoriesChart = {
    labels: stats.postsByCategory.labels || [],
    datasets: [
      {
        label: 'Posts by Category',
        data: stats.postsByCategory.counts || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderWidth: 1
      }
    ]
  };
  
  const reviewRatingsChart = {
    labels: stats.reviewsRatingDistribution.labels || [],
    datasets: [
      {
        label: 'Review Ratings',
        data: stats.reviewsRatingDistribution.counts || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 205, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)', 
          'rgba(54, 162, 235, 0.7)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)'
        ],
        borderWidth: 1
      }
    ]
  };

  const courseCategoriesChart = {
    labels: stats.coursesByCategory.labels || [],
    datasets: [
      {
        label: 'Courses by Category',
        data: stats.coursesByCategory.counts || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
        ],
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 text-red-800 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with greeting, time, and report generation button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold">
          <span className="text-blue-600">{getGreeting()}, {currentUser?.username}!</span>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your platform today
          </p>
        </h1>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <Button 
            color="blue" 
            size="sm" 
            onClick={generateReport} 
            disabled={generatingReport}
            className="flex items-center"
          >
            <HiDownload className="mr-2" />
            {generatingReport ? 'Generating...' : 'Generate Detailed Report'}
          </Button>
          
          <div className="text-right">
            <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
              {format(currentTime, 'h:mm a')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(currentTime, 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>

      {/* Content for the dashboard */}
      <div>
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <h5 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.userCount}</h5>
                <p className="text-xs mt-1 text-gray-500">
                  <span className="text-green-500 font-medium">{stats.activeUsers} active</span> in last 30 days
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
                <HiUsers className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </Card>
          
          {/* Posts Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Posts</p>
                <h5 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.postCount}</h5>
                <p className="text-xs mt-1 text-gray-500">
                  From {stats.postsByCategory.labels?.length || 0} categories
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
                <HiDocumentText className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </Card>
          
          {/* Reviews Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Reviews</p>
                <h5 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.reviewCount}</h5>
                <div className="flex items-center mt-1">
                  <div className="flex items-center mr-1">
                    <HiStar className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs ml-0.5 font-semibold">{stats.averageRating}</span>
                  </div>
                  <span className="text-xs text-gray-500">avg rating</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full dark:bg-yellow-900">
                <HiStar className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </Card>
          
          {/* Courses Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Courses</p>
                <h5 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.courseCount}</h5>
                <p className="text-xs mt-1 text-gray-500">
                  From {stats.coursesByCategory.labels?.length || 0} categories
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900">
                <HiAcademicCap className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card>
            <h5 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">User Growth</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Monthly new user registrations</p>
            <div className="h-80" ref={userChartRef}>
              <Line 
                data={userGrowthChart} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card>
          
          {/* Posts by Category */}
          <Card>
            <h5 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Posts by Category</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Distribution of posts across categories</p>
            <div className="h-80" ref={postChartRef}>
              <Bar 
                data={postCategoriesChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Review Ratings Distribution */}
          <Card>
            <h5 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Review Ratings</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Distribution of reviews by rating</p>
            <div className="h-80 flex items-center justify-center" ref={reviewChartRef}>
              <div className="w-4/5 h-4/5">
                <Pie 
                  data={reviewRatingsChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      }
                    }
                  }}
                />
              </div>
            </div>
          </Card>
          
          {/* Courses by Category */}
          <Card>
            <h5 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Courses by Category</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Distribution of courses across categories</p>
            <div className="h-80" ref={courseChartRef}>
              <Bar 
                data={courseCategoriesChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>
        </div>
        
        {/* Rating Table */}
        <Card className="mt-6">
          <h5 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Rating Analysis</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Detailed breakdown of reviews by rating</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Rating</th>
                  <th scope="col" className="px-6 py-3">Count</th>
                  <th scope="col" className="px-6 py-3">Percentage</th>
                  <th scope="col" className="px-6 py-3">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = stats.reviewsRatingDistribution.counts?.[rating-1] || 0;
                  const percentage = stats.reviewCount ? 
                    ((count / stats.reviewCount) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <tr key={rating} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium flex items-center">
                        <div className="flex items-center mr-2">
                          {Array.from({length: 5}).map((_, i) => (
                            <HiStar 
                              key={i}
                              className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span>{rating} Star{rating > 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-6 py-4">{count}</td>
                      <td className="px-6 py-4">{percentage}%</td>
                      <td className="px-6 py-4">
                        <Badge
                          color={rating >= 4 ? 'success' : rating === 3 ? 'warning' : 'failure'}
                        >
                          {rating >= 4 ? 'Positive' : rating === 3 ? 'Neutral' : 'Needs Improvement'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                  <td className="px-6 py-4">Average Rating</td>
                  <td className="px-6 py-4">{stats.reviewCount}</td>
                  <td className="px-6 py-4">100%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <HiStar className="w-5 h-5 text-yellow-400 mr-1" />
                      <span>{stats.averageRating} / 5</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      {/* Report generation status */}
      {generatingReport && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50">
          <Spinner size="sm" />
          <span>Generating comprehensive report...</span>
        </div>
      )}
    </div>
  );
}