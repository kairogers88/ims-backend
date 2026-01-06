const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Intern Management System API',
            version: '1.0.0',
            description: 'REST API for handling intern applications, onboarding, enrollment, and daily reports.'
        },
        servers: [
            {
                url: 'http://localhost:{port}',
                description: 'Local dev server',
                variables: {
                    port: {
                        default: '5000'
                    }
                }
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                ApiResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                },
                ApplicationRequest: {
                    type: 'object',
                    required: ['fullName', 'enrollmentNo', 'email', 'mobile'],
                    properties: {
                        fullName: { type: 'string', example: 'Jane Doe' },
                        enrollmentNo: { type: 'string', example: 'IMF2024-01' },
                        email: { type: 'string', format: 'email', example: 'jane@example.com' },
                        mobile: { type: 'string', example: '9876543210' }
                    }
                },
                AdminDecisionRequest: {
                    type: 'object',
                    required: ['id', 'decision'],
                    properties: {
                        id: { type: 'integer', example: 12 },
                        decision: { type: 'string', enum: ['Approved', 'Rejected'] }
                    }
                },
                AdminOnboardRequest: {
                    type: 'object',
                    required: ['id', 'applicationNo', 'dateOfJoining', 'dateOfLeaving'],
                    properties: {
                        id: { type: 'integer', example: 12 },
                        applicationNo: { type: 'string', example: 'IMS/24/0042' },
                        dateOfJoining: { type: 'string', format: 'date', example: '2025-01-15' },
                        dateOfLeaving: { type: 'string', format: 'date', example: '2025-04-15' }
                    }
                },
                DailyReportRequest: {
                    type: 'object',
                    required: ['domain', 'workDescription'],
                    properties: {
                        domain: { type: 'string', example: 'Digital Forensics' },
                        workDescription: { type: 'string', example: 'Analyzed disk images for malware artifacts.' },
                        toolsUsed: { type: 'string', example: 'Autopsy, Volatility' },
                        issuesFaced: { type: 'string', example: 'Limited RAM on target VM' }
                    }
                }
            }
        },
        paths: {
            '/api/applications': {
                get: {
                    tags: ['Application'],
                    summary: 'List all fresh applications',
                    responses: {
                        200: {
                            description: 'Array of intern applications with status Fresh',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'integer' },
                                                fullName: { type: 'string' },
                                                enrollmentNo: { type: 'string' },
                                                personalEmail: { type: 'string' },
                                                mobileNo: { type: 'string' },
                                                status: { type: 'string' },
                                                createdAt: { type: 'string', format: 'date-time' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/apply': {
                post: {
                    tags: ['Application'],
                    summary: 'Submit internship application',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['fullName', 'enrollmentNo', 'email', 'mobile', 'loi'],
                                    properties: {
                                        fullName: { type: 'string' },
                                        enrollmentNo: { type: 'string' },
                                        email: { type: 'string', format: 'email' },
                                        mobile: { type: 'string' },
                                        loi: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'Letter of Intent PDF'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'Application submitted',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ApiResponse' }
                                }
                            }
                        },
                        400: {
                            description: 'Invalid data or file signature'
                        }
                    }
                }
            },
            '/api/admin/decision': {
                post: {
                    tags: ['Admin'],
                    summary: 'Approve or reject a fresh application',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AdminDecisionRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Decision recorded',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ApiResponse' }
                                }
                            }
                        },
                        401: { description: 'Unauthorized' }
                    }
                }
            },
            '/api/admin/onboard': {
                post: {
                    tags: ['Admin'],
                    summary: 'Finalize onboarding for an intern',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AdminOnboardRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Intern onboarded',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ApiResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/admin/dashboard/ongoing': {
                get: {
                    tags: ['Admin'],
                    summary: 'Get ongoing intern dashboard metrics',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'List of active interns',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'integer' },
                                                hyperlinkText: { type: 'string' },
                                                start: { type: 'string', format: 'date' },
                                                end: { type: 'string', format: 'date' },
                                                daysSinceStart: { type: 'integer' },
                                                daysAttended: { type: 'integer' },
                                                attendancePct: { type: 'string' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/intern/enroll/{id}': {
                post: {
                    tags: ['Intern'],
                    summary: 'Submit enrollment details with documents',
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            schema: { type: 'integer' }
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        photo: { type: 'string', format: 'binary' },
                                        sign: { type: 'string', format: 'binary' },
                                        nda: { type: 'string', format: 'binary' },
                                        semester: { type: 'string' },
                                        program: { type: 'string' },
                                        department: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Enrollment submitted',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ApiResponse' }
                                }
                            }
                        },
                        400: { description: 'Invalid file signature detected' }
                    }
                }
            },
            '/api/intern/report': {
                post: {
                    tags: ['Intern'],
                    summary: 'Submit daily report',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/DailyReportRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Report logged',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ApiResponse' }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;