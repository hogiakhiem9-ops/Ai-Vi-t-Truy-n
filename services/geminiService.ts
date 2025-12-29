import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, AUTHOR_LEVEL_PROMPTS } from '../constants';
import { Message, Role, AppMode, WritingSettings } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

export const sendMessageToGemini = async (
  history: Message[],
  currentMessage: string,
  mode: AppMode,
  settings: WritingSettings
): Promise<string> => {
  try {
    // Determine the style instruction based on Author Level
    let styleInstruction = "";
    if (settings.authorLevel === 'Custom') {
        styleInstruction = `[CHỈ THỊ ĐẶC BIỆT CỦA NGƯỜI DÙNG]: ${settings.customInstructions}`;
    } else {
        styleInstruction = `[TRÌNH ĐỘ TÁC GIẢ - ${settings.authorLevel}]: ${AUTHOR_LEVEL_PROMPTS[settings.authorLevel]}`;
    }

    // Detect if user is asking to create a story
    const creationKeywords = ['tạo truyện', 'viết truyện', 'sáng tác', 'ý tưởng truyện', 'lập dàn ý', 'novel', 'tiểu thuyết'];
    const isCreationRequest = creationKeywords.some(kw => currentMessage.toLowerCase().includes(kw));

    let strictFormatInstruction = "";
    if (isCreationRequest) {
        strictFormatInstruction = `
        YÊU CẦU ĐẶC BIỆT: Người dùng đang yêu cầu TẠO TRUYỆN MỚI.
        Hãy trả về kết quả CHỈ bao gồm 3 phần sau, không được phép có lời chào hay lời dẫn:
        1. Tên truyện (Viết dạng Tiêu đề lớn Markdown #)
        2. Thể loại (In đậm)
        3. Giới thiệu nội dung (Tóm tắt hấp dẫn)
        KHÔNG VIẾT NỘI DUNG TRUYỆN HAY CHƯƠNG 1 LÚC NÀY.
        `;
    }

    // Construct a specific instruction block based on user settings
    const settingsContext = `
    [CẤU HÌNH SÁNG TÁC]:
    - Giọng văn (Tone): ${settings.tone}
    - Ngôi kể (POV): ${settings.pov}
    - Độ dài phản hồi: ${settings.responseLength}
    ${styleInstruction}
    `;

    const modeInstruction = `
    ${settingsContext}
    ${strictFormatInstruction}
    [BẠN ĐANG Ở: ${mode}]. Hãy thực hiện yêu cầu sau: ${currentMessage}`;

    const contents = history.map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add the new message
    contents.push({
      role: 'user',
      parts: [{ text: modeInstruction }]
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: settings.creativityLevel,
        maxOutputTokens: settings.responseLength === 'Short' ? 1024 : 8192, 
      }
    });

    if (response.text) {
        return response.text;
    }
    
    return "Xin lỗi, tôi không thể tạo nội dung lúc này.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.";
  }
};

export const compileStory = async (history: Message[]): Promise<string> => {
  try {
    // Convert history to a text block for context
    const conversationText = history.map(msg => 
      `${msg.role === Role.USER ? 'USER' : 'AI'}: ${msg.text}`
    ).join('\n---\n');

    const prompt = `
    Bạn là một Biên tập viên Văn học cao cấp. Nhiệm vụ của bạn là TỔNG HỢP và BIÊN TẬP lại toàn bộ nội dung sáng tác từ lịch sử cuộc trò chuyện dưới đây thành một tác phẩm hoàn chỉnh để xuất bản.

    Dưới đây là lịch sử trò chuyện:
    ${conversationText}

    YÊU CẦU XỬ LÝ:
    1. **LỌC BỎ HOÀN TOÀN**: 
       - Các câu giao tiếp xã giao (VD: "Chào bạn", "Tôi đã viết xong", "Bạn thấy sao?").
       - Các yêu cầu của người dùng (VD: "Viết tiếp đi", "Sửa đoạn này").
       - Các lời dẫn chuyện thừa thãi của AI.
    2. **GIỮ LẠI VÀ KẾT NỐI**: Chỉ giữ lại phần văn bản truyện (văn học), các chương, các đoạn mô tả. Ghép chúng lại thành một luồng liền mạch.
    3. **TRÍCH XUẤT THÔNG TIN**:
       - Tự đặt Tên truyện (nếu chưa có).
       - Xác định Thể loại.
       - Viết một Giới thiệu/Tóm tắt nội dung hấp dẫn.

    ĐỊNH DẠNG ĐẦU RA (Markdown):
    # [TÊN TRUYỆN]
    
    **Thể loại:** [Thể loại]
    **Giới thiệu:**
    [Đoạn giới thiệu nội dung]

    ---
    
    ## Nội dung chính
    
    [Toàn bộ nội dung truyện đã được làm sạch và ghép nối...]
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.3, // Low temperature for consistent compilation
        maxOutputTokens: 8192,
      }
    });

    return response.text || "Không thể tổng hợp nội dung.";
  } catch (error) {
    console.error("Compile Story Error:", error);
    throw error;
  }
};