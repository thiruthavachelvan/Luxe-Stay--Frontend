import { FileText, Download } from 'lucide-react';
import { motion } from 'motion/react';

const DocumentationDownload = () => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/LuxeStay_System_API_Documentation.pdf';
        link.download = 'LuxeStay_System_API_Documentation.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed top-8 right-8 z-50 flex items-start gap-3">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative bg-navy-900/90 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-2xl max-w-[240px]"
            >
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gold-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Test Documentation</h3>
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed">
                    To test this application, kindly download this documentation.
                </p>

                {/* Connector Arrow */}
                <div className="absolute top-4 -right-1.5 w-3 h-3 bg-navy-900/90 border-t border-r border-white/10 rotate-45 transform" />
            </motion.div>

            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onClick={handleDownload}
                className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all hover:scale-110 active:scale-95 group"
                title="Download Documentation"
            >
                <Download className="w-6 h-6 group-hover:animate-bounce" />
            </motion.button>
        </div>
    );
};

export default DocumentationDownload;
