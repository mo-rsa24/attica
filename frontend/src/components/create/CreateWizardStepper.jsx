import React, { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function CreateWizardStepper({
    title,
    steps,
    onSubmit,
    submitting,
    topContent,
    submitLabel = 'Publish',
    submittingLabel = 'Saving...',
}) {
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (activeStep > steps.length - 1) {
            setActiveStep(Math.max(steps.length - 1, 0));
        }
    }, [activeStep, steps.length]);

    const isLastStep = activeStep === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onSubmit();
        } else {
            setActiveStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (activeStep === 0) {
            navigate(-1);
        } else {
            setActiveStep(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <h1
                    className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    {title}
                </h1>

                {topContent ? <div className="mb-6">{topContent}</div> : null}

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
                    {steps.map((step) => (
                        <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 12px 35px rgba(15,23,42,0.08)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                    }}
                >
                    {steps[activeStep].content}
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 8 }}>
                    <Button
                        onClick={handleBack}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 4,
                            borderColor: '#d1d5db',
                            color: '#374151',
                            '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
                        }}
                    >
                        {activeStep === 0 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 4,
                            bgcolor: '#ec4899',
                            '&:hover': { bgcolor: '#db2777' },
                        }}
                    >
                        {submitting ? submittingLabel : isLastStep ? submitLabel : 'Next'}
                    </Button>
                </Box>
            </div>
        </div>
    );
}
