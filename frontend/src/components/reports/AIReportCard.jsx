import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export function AIReportCard({ type = 'progress' }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const endpoint = type === 'progress' ? '/reports/progress/' : '/reports/hero/';
      const response = await api.post(endpoint);
      return response.data;
    },
    onSuccess: (data) => {
      setReport(data);
      toast.success('🎉 AI report generated successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.error || 'Failed to generate report';
      toast.error(`😔 ${message}`);
    },
  });

  const handleGenerateReport = () => {
    setIsLoading(true);
    generateReportMutation.mutate();
    setIsLoading(false);
  };

  const getReportIcon = () => {
    return type === 'progress' ? '📊' : '🦸‍♂️';
  };

  const getReportTitle = () => {
    return type === 'progress' ? 'AI Progress Report' : 'Hero Journey Report';
  };

  const getReportDescription = () => {
    return type === 'progress' 
      ? 'Get personalized insights about your habit journey with AI analysis'
      : 'See your achievements and get motivational insights from your AI coach';
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          {getReportIcon()} {getReportTitle()}
        </CardTitle>
        <CardDescription>
          {getReportDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!report ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Ready for AI Magic?
            </h3>
            <p className="text-gray-600 mb-6">
              Let your AI coach analyze your progress and give you personalized insights!
            </p>
            <Button 
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {generateReportMutation.isPending || isLoading ? (
                <>🔄 Generating AI Magic...</>
              ) : (
                <>✨ Generate {type === 'progress' ? 'Progress Report' : 'Hero Report'}</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {report.title || getReportTitle()}
              </h2>
              {type === 'progress' && report.completion_rate && (
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-4 py-2">
                  <span className="text-lg font-bold text-green-700">
                    {report.completion_rate.toFixed(1)}% Complete
                  </span>
                </div>
              )}
            </div>

            {/* Motivational Message */}
            {report.motivational_message && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🌟</div>
                <p className="text-lg text-orange-800 font-medium italic">
                  "{report.motivational_message}"
                </p>
              </div>
            )}

            {/* Progress Report Specific Content */}
            {type === 'progress' && (
              <div className="space-y-4">
                {/* Summary */}
                {report.summary && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      📈 Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{report.summary}</p>
                  </div>
                )}

                {/* Insights */}
                {report.insights && report.insights.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      🧠 AI Insights
                    </h3>
                    <div className="space-y-3">
                      {report.insights.map((insight, index) => (
                        <div key={index} className="border-l-4 border-purple-300 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {insight.insight_type || insight.type}
                            </Badge>
                            {insight.confidence && (
                              <span className="text-xs text-gray-500">
                                {Math.round(insight.confidence * 100)}% confidence
                              </span>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-800">{insight.title}</h4>
                          <p className="text-gray-600 text-sm">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {report.recommendations && report.recommendations.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      💡 Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {report.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Hero Report Specific Content */}
            {type === 'hero' && (
              <div className="space-y-4">
                {/* Stats */}
                {report.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">
                        {report.stats.total_habits}
                      </div>
                      <div className="text-sm text-gray-600">Active Quests 🎯</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl font-bold text-green-600">
                        {report.stats.completion_rate?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-gray-600">Success Rate ✅</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl font-bold text-orange-600">
                        {report.stats.longest_streak}
                      </div>
                      <div className="text-sm text-gray-600">Longest Streak 🔥</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">
                        {report.stats.level}
                      </div>
                      <div className="text-sm text-gray-600">Hero Level ⚡</div>
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {report.achievements && report.achievements.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      🏆 Recent Achievements
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {report.achievements.map((achievement, index) => (
                        <Badge key={index} variant="outline" className="bg-gradient-to-r from-yellow-100 to-orange-100 border-orange-300">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Generate New Report Button */}
            <div className="text-center pt-4">
              <Button 
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending || isLoading}
                variant="outline"
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                {generateReportMutation.isPending || isLoading ? (
                  <>🔄 Generating...</>
                ) : (
                  <>🔄 Generate New Report</>
                )}
              </Button>
            </div>

            {/* Metadata */}
            <div className="text-center text-xs text-gray-500">
              Generated {report.generated_at && new Date(report.generated_at).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}