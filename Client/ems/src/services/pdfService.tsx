import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Answer } from '../types';

// Key changes to accommodate 5 questions per page:

export const generateResultPDFWithQuestions = async (result: Answer, questions: any[] = []): Promise<void> => {
    try {
        // Initialize PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 190;
        let pageNumber = 1;


        // Step 1: Generate Summary Page
        const summaryDiv = document.createElement('div');
        summaryDiv.style.position = 'absolute';
        summaryDiv.style.left = '-9999px';
        summaryDiv.style.width = '800px';
        summaryDiv.style.padding = '15px';
        summaryDiv.style.backgroundColor = 'white';
        summaryDiv.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        summaryDiv.style.lineHeight = '1.4';

        summaryDiv.innerHTML = `
      <div style="border: 2px solid #DC143C; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 1150px;">
        <!-- Header -->
        <div style="text-align: center; background: linear-gradient(135deg, #DC143C, #B22222); color: white; padding: 15px; margin: -20px -20px 20px -20px; border-radius: 6px 6px 0 0;">
        <h1 style="margin: 0; font-size: 22px; letter-spacing: 1px;">
            <span style="font-size: 14px; display: block; font-weight: normal; opacity: 0.9;">Crimson College Of Technology</span>
            EXAM RESULT CERTIFICATE
        </h1>
          <p style="margin: 5px 0 0; opacity: 0.9; font-size: 13px;">Detailed Performance Report</p>
        </div>
        
        <!-- Student Information -->
        <div style="margin-bottom: 18px; background: #f9fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #DC143C;">
          <h2 style="color: #DC143C; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 0; font-size: 14px; display: flex; align-items: center;">
            <svg style="margin-right: 8px;" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#DC143C" stroke-width="2"/>
              <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#DC143C" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Student Information
          </h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 8px; font-size: 12px;">
            <div><span style="font-weight: bold; color: #4b5563;">Name:</span> ${result.studentId?.name || 'N/A'}</div>
            <div><span style="font-weight: bold; color: #4b5563;">Email:</span> ${result.studentId?.email || 'N/A'}</div>
            <div><span style="font-weight: bold; color: #4b5563;">Program:</span> ${result.studentId?.program || 'N/A'}</div>
            <div><span style="font-weight: bold; color: #4b5563;">Student ID:</span> ${result.studentId?._id || 'N/A'}</div>
          </div>
        </div>
        
        <!-- Exam Information -->
        <div style="margin-bottom: 18px; background: #f9fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #DC143C;">
          <h2 style="color: #DC143C; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-top: 0; font-size: 14px; display: flex; align-items: center;">
            <svg style="margin-right: 8px;" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#DC143C" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="#DC143C" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Exam Information
          </h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 8px; font-size: 12px;">
            <div><span style="font-weight: bold; color: #4b5563;">Exam Title:</span> ${result.examId?.title || 'N/A'}</div>
            <div><span style="font-weight: bold; color: #4b5563;">Date:</span> ${result.examId?.date ? new Date(result.examId.date).toLocaleDateString() : 'N/A'}</div>
            <div><span style="font-weight: bold; color: #4b5563;">Started At:</span> ${result.startedAt ? new Date(result.startedAt).toLocaleString() : 'N/A'}</div>
            <div><span style="font-weight: bold; color: #4b5563;">Submitted At:</span> ${result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'N/A'}</div>
          </div>
        </div>
        
        <!-- Performance Summary -->
        <div style="background: linear-gradient(135deg, #fef2f2, #fef2f2); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fecaca; text-align: center;">
          <h2 style="color: #DC143C; margin-top: 0; font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; line-height:1">
            <svg style="margin-right: 8px;" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="#DC143C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#DC143C" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Performance Summary
          </h2>
          <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 12px; margin: 10px 0;">
            <div style="background: white; padding: 10px 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); min-width: 120px;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 3px;">Score</div>
              <div style="font-size: 18px; font-weight: bold; color: #DC143C;">${result.score || 0}/${result.totalQuestions || 0}</div>
            </div>
            <div style="background: white; padding: 10px 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); min-width: 120px;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 3px;">Percentage</div>
              <div style="font-size: 18px; font-weight: bold; color: #DC143C;">${result.percentage?.toFixed(2) || 0}%</div>
            </div>
            <div style="background: white; padding: 10px 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); min-width: 120px;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 3px;">Result</div>
              <div style="font-size: 18px; font-weight: bold; color: ${result.result === 'pass' ? '#10b981' : result.result === 'fail' ? '#DC143C' : '#6b7280'};">${result.result?.toUpperCase() || 'PENDING'}</div>
            </div>
            ${result.rank ? `
            <div style="background: white; padding: 10px 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); min-width: 120px;">
              <div style="font-size: 11px; color: #6b7280; margin-bottom: 3px;">Rank</div>
              <div style="font-size: 18px; font-weight: bold; color: #DC143C;">#${result.rank}</div>
            </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Footer -->
        <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>Generated by Exam System</div>
          <div>Page ${pageNumber}</div>
          <div>${new Date().toLocaleString()}</div>
        </div>
      </div>
    `;

        document.body.appendChild(summaryDiv);
        await new Promise(resolve => setTimeout(resolve, 500));

        const summaryCanvas = await html2canvas(summaryDiv, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
        });

        document.body.removeChild(summaryDiv);

        // Add summary page to PDF
        const summaryImgData = summaryCanvas.toDataURL('image/jpeg', 0.9);
        const summaryImgHeight = (summaryCanvas.height * imgWidth) / summaryCanvas.width;
        pdf.addImage(summaryImgData, 'JPEG', 10, 10, imgWidth, summaryImgHeight);

        // Step 2: Generate Questions Pages (5 questions per page)
        if (result.validationDetails && result.validationDetails.length > 0) {
            const questionsPerPage = 5;
            // const totalPages = Math.ceil(result.validationDetails.length / questionsPerPage);

            for (let i = 0; i < result.validationDetails.length; i += questionsPerPage) {
                pageNumber++;
                const pageQuestions = result.validationDetails.slice(i, i + questionsPerPage);
                const currentPageNumber = Math.floor(i / questionsPerPage) + 2;

                // Create questions page with increased height
                const questionsDiv = document.createElement('div');
                questionsDiv.style.position = 'absolute';
                questionsDiv.style.left = '-9999px';
                questionsDiv.style.width = '800px';
                questionsDiv.style.padding = '15px';
                questionsDiv.style.backgroundColor = 'white';
                questionsDiv.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
                questionsDiv.style.lineHeight = '1.4';

                let questionsHTML = `
          <div style="border: 2px solid #DC143C; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); min-height: 1125px; position: relative;">
        `; // CHANGED: Increased min-height from 1000px to 1200px

                // Add header only on first questions page
                if (i === 0) {
                    questionsHTML += `
            <!-- Answer Breakdown Header -->
            <div style="margin-bottom: 12px;"> <!-- CHANGED: Reduced margin from 15px to 12px -->
              <h2 style="color: #DC143C; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; font-size: 14px; margin-bottom: 12px; display: flex; align-items: center;">
                <!-- SVG icon -->
                <svg style="margin-right: 8px;" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#DC143C" stroke-width="2"/>
                  <path d="M9.08997 9.00008C9.32507 8.33175 9.78912 7.76819 10.3999 7.40921C11.0107 7.05024 11.7289 6.919 12.4271 7.03879C13.1254 7.15859 13.7588 7.52161 14.215 8.06361C14.6713 8.60561 14.921 9.29160 14.92 10.0001C14.92 12.0001 11.92 13.0001 11.92 13.0001" stroke="#DC143C" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 17H12.01" stroke="#DC143C" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Answer Breakdown
              </h2>
            </div>
          `;
                }

                questionsHTML += `<div style="margin-top: 8px;">`; // CHANGED: Reduced margin from 12px to 8px

                // Add questions to this page with optimized spacing
                pageQuestions.forEach((detail, pageIndex) => {
                    const globalIndex = i + pageIndex;
                    const question = questions.find(q => q._id === detail.questionId) || {};
                    const questionText = question.question || detail.questionText || 'Question text not available';
                    const options = question.options || ['Option A', 'Option B', 'Option C', 'Option D'];

                    questionsHTML += `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin-bottom: 20px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); page-break-inside: avoid;">
              <!-- CHANGED: Reduced padding from 12px to 10px, margin-bottom from 32px to 20px -->
              
              <!-- Question Header -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <!-- CHANGED: Reduced margin-bottom from 10px to 8px -->
                <div style="background: #DC143C; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; box-shadow: 0 1px 2px rgba(220, 20, 60, 0.3);">
                  ${globalIndex + 1}
                </div>
                <div style="padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; ${detail.isCorrect ? 'background: #dcfce7; color: #166534; border: 1px solid #22c55e;' : 'background: #fef2f2; color: #dc2626; border: 1px solid #ef4444;'}">
                  ${detail.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </div>
              </div>
              
              <!-- Question Text -->
              <div style="margin-bottom: 8px;"> <!-- CHANGED: Reduced margin from 10px to 8px -->
                <p style="font-size: 11px; font-weight: 600; color: #1f2937; margin: 0; line-height: 1.3;">
                  <!-- CHANGED: Reduced font-size from 12px to 11px, line-height from 1.4 to 1.3 -->
                  ${questionText}
                </p>
              </div>
              
              <!-- Options - More compact layout -->
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; margin-bottom: 6px;">
                <!-- CHANGED: Reduced gap from 6px to 4px, margin-bottom from 8px to 6px -->
            ${['a', 'b', 'c', 'd'].map((optionKey, optionIndex) => {
                        const optionText = options[optionIndex] || `Option ${optionKey.toUpperCase()}`;
                        const isUserAnswer = detail.selectedAnswer === optionKey;
                        const isCorrectAnswer = detail.correctAnswer === optionKey;

                        let containerStyle = 'margin: 4px 0; padding: 4px 6px; border: 1px solid #e5e7eb; background: #f9fafb; color: #374151; border-radius: 4px; font-size: 9px; line-height: 16px;';
                        let circleStyle = 'width: 16px; height: 16px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 8px; background: rgba(0,0,0,0.1); vertical-align: middle; line-height: 16px;';
                        let icon = '';

                        if (isUserAnswer && isCorrectAnswer) {
                            containerStyle += ' border: 1px solid #10b981; background: #d1fae5; color: #065f46;';
                            circleStyle = circleStyle.replace('rgba(0,0,0,0.1)', '#10b981').replace('color: #374151;', 'color: white;');
                            icon = '<span style="color: #10b981; font-weight: bold; margin-left: 4px;">✓</span>';
                        } else if (isUserAnswer && !isCorrectAnswer) {
                            containerStyle += ' border: 1px solid #ef4444; background: #fee2e2; color: #991b1b;';
                            circleStyle = circleStyle.replace('rgba(0,0,0,0.1)', '#ef4444').replace('color: #374151;', 'color: white;');
                            icon = '<span style="color: #ef4444; font-weight: bold; margin-left: 4px;">✗</span>';
                        } else if (isCorrectAnswer) {
                            containerStyle += ' border: 1px solid #10b981; background: #d1fae5; color: #065f46;';
                            circleStyle = circleStyle.replace('rgba(0,0,0,0.1)', '#10b981').replace('color: #374151;', 'color: white;');
                        }

                        return `
        <div style="${containerStyle}">
            <span style="${circleStyle}">${optionKey.toUpperCase()}</span>
            <span style="font-size: 9px; line-height: 16px; margin-left: 4px;">${optionText}</span>
            ${icon}
        </div>
    `;
                    }).join('')}
              </div>
              
              <!-- Answer Summary - More compact -->
              <div style="background: #f8fafc; padding: 4px 6px; border-radius: 4px; border-left: 2px solid ${detail.isCorrect ? '#10b981' : '#ef4444'}; display: flex; justify-content: space-between; font-size: 9px;">
                <!-- CHANGED: Reduced padding from 6px 8px to 4px 6px, font-size from 10px to 9px -->
                <div style="color: #64748b;">
                  <strong>Your Answer:</strong> 
                  <span style="color: ${detail.isCorrect ? '#10b981' : '#ef4444'}; font-weight: bold;">
                    ${detail.selectedAnswer?.toUpperCase() || 'Not answered'}
                  </span>
                </div>
                <div style="color: #64748b;">
                  <strong>Correct Answer:</strong> 
                  <span style="color: #10b981; font-weight: bold;">
                    ${detail.correctAnswer?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          `;
                });

                questionsHTML += `
            </div>
            
            <!-- Footer -->
            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>Generated by Exam System</div>
              <div>Page ${currentPageNumber}</div>
              <div>${new Date().toLocaleString()}</div>
            </div>
          </div>
        `;

                // Rest of the canvas generation code remains the same...
                questionsDiv.innerHTML = questionsHTML;
                document.body.appendChild(questionsDiv);

                await new Promise(resolve => setTimeout(resolve, 500));

                const questionsCanvas = await html2canvas(questionsDiv, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false,
                    height: 1200, // CHANGED: Increased canvas height to match container
                });

                document.body.removeChild(questionsDiv);
                // Add new page and draw image only once
                pdf.addPage();
                const questionsImgData = questionsCanvas.toDataURL('image/jpeg', 0.9);
                const questionsImgHeight = (questionsCanvas.height * imgWidth) / questionsCanvas.width;

                // Draw image centered vertically with margin
                pdf.addImage(questionsImgData, 'JPEG', 10, 10, imgWidth, questionsImgHeight);
            }
        }

        // Save the PDF
        const fileName = `${result.studentId?.name?.replace(/\s+/g, '_') || 'result'}_detailed_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
};

// Helper function to fetch questions if needed
export const fetchQuestionsForResult = async (result: Answer, apiService: any): Promise<any[]> => {
    try {
        // Extract unique question IDs from validation details
        const questionIds = result.validationDetails?.map(detail => detail.questionId).filter(Boolean) || [];

        if (questionIds.length === 0) {
            return [];
        }

        // Fetch questions using the API service
        const questions = await apiService.getQuestionsByIds(questionIds);
        return questions;

    } catch (error) {
        console.error('Error fetching questions:', error);
        return [];
    }
};
