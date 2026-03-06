package com.taskflow;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskflow.dto.LoginRequest;
import com.taskflow.dto.RegisterRequest;
import com.taskflow.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

// import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private static final String AUTH_BASE = "/api/auth";

    @BeforeEach
    void cleanUp() {
        userRepository.deleteAll();
    }

    // ─── Registration Tests 

    @Test
    @Order(1)
    @DisplayName("FR-AUTH-01: Successful user registration returns 201 + JWT")
    void registerSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("John Doe")
                .email("john@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    @Order(2)
    @DisplayName("FR-AUTH-01: Duplicate email returns 400")
    void registerDuplicateEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("John Doe")
                .email("john@example.com")
                .password("password123")
                .build();

        // First registration
        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second registration with same email
        RegisterRequest dup = RegisterRequest.builder()
                .username("Jane Doe")
                .email("john@example.com")
                .password("password456")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dup)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already in use"));
    }

    @Test
    @Order(3)
    @DisplayName("FR-AUTH-01: Duplicate username returns 400")
    void registerDuplicateUsername() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("John Doe")
                .email("john@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        RegisterRequest dup = RegisterRequest.builder()
                .username("John Doe")
                .email("jane@example.com")
                .password("password456")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dup)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Username is already taken"));
    }

    @Test
    @Order(4)
    @DisplayName("FR-AUTH-01: Invalid email format returns 400 validation error")
    void registerInvalidEmail() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("John Doe")
                .email("not-an-email")
                .password("password123")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    @Order(5)
    @DisplayName("FR-AUTH-01: Password < 8 chars returns validation error")
    void registerShortPassword() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("John Doe")
                .email("john@example.com")
                .password("short")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @Order(6)
    @DisplayName("FR-AUTH-01: Missing fields returns validation errors")
    void registerMissingFields() throws Exception {
        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").isNotEmpty());
    }

    // ─── Login Tests

    @Test
    @Order(7)
    @DisplayName("FR-AUTH-02: Successful login returns 200 + JWT")
    void loginSuccess() throws Exception {
        // First register
        RegisterRequest regReq = RegisterRequest.builder()
                .username("John Doe")
                .email("john@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        // Then login
        LoginRequest loginReq = LoginRequest.builder()
                .email("john@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    @Order(8)
    @DisplayName("FR-AUTH-02: Wrong password returns 401")
    void loginWrongPassword() throws Exception {
        // Register first
        RegisterRequest regReq = RegisterRequest.builder()
                .username("John Doe")
                .email("john@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        // Login with wrong password
        LoginRequest loginReq = LoginRequest.builder()
                .email("john@example.com")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password. Please try again."));
    }

    @Test
    @Order(9)
    @DisplayName("FR-AUTH-02: Non-existent email returns 401")
    void loginNonExistentUser() throws Exception {
        LoginRequest loginReq = LoginRequest.builder()
                .email("nobody@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post(AUTH_BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    // ─── Helper: get JWT token for authenticated tests 

    static String registerAndGetToken(MockMvc mockMvc, ObjectMapper mapper) throws Exception {
        RegisterRequest regReq = RegisterRequest.builder()
                .username("TestUser")
                .email("testuser@example.com")
                .password("password123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        return mapper.readTree(body).get("token").asText();
    }
}
